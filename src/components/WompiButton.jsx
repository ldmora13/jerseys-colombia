import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import LogoBancolombia from '../assets/LogoBancolombia.png';

const WompiButton = ({ 
    orderId, 
    amount, 
    description, 
    customerData, 
    billingAddress,
    reference 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Cargar el script de Wompi (único para ambos ambientes)
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        script.onload = () => {
            console.log('✅ Wompi sandbox script cargado correctamente');
            setIsScriptLoaded(true);
        };
        script.onerror = () => {
            console.error('❌ Error al cargar el script de Wompi');
            setError('No se pudo cargar el sistema de pagos. Verifica tu conexión.');
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const validateData = () => {
        const errors = [];

        // Validar email
        if (!customerData.email || !customerData.email.includes('@')) {
            errors.push('Email inválido');
        }

        // Validar nombre completo
        if (!customerData.fullName || customerData.fullName.trim().length < 3) {
            errors.push('Nombre completo requerido');
        }

        // Validar documento de identidad
        if (!customerData.legalId || customerData.legalId.toString().trim().length < 6) {
            errors.push('Número de documento inválido (mínimo 6 dígitos)');
        }

        if (!customerData.typeLegalId) {
            errors.push('Tipo de documento requerido');
        }

        // Validar teléfono
        const cleanPhone = (billingAddress.phone || '').replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            errors.push('Número de teléfono inválido (mínimo 10 dígitos)');
        }

        // Validar dirección
        if (!billingAddress.address || billingAddress.address.trim().length < 5) {
            errors.push('Dirección inválida');
        }

        if (!billingAddress.city || !billingAddress.state) {
            errors.push('Ciudad y departamento requeridos');
        }

        return errors;
    };

    const handlePayment = async () => {
        if (!isScriptLoaded) {
            setError('El sistema de pagos aún está cargando. Por favor espera un momento.');
            return;
        }

        // Validar datos antes de procesar
        const validationErrors = validateData();
        if (validationErrors.length > 0) {
            setError(`Datos inválidos: ${validationErrors.join(', ')}`);
            console.error('Errores de validación:', validationErrors);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const amountInCents = Number(amount);

            const { data: config, error: configError } = await supabase.functions.invoke('get-wompi-config');
            if (configError) throw new Error(`Error de configuración: ${configError.message}`);
            if (!config || !config.publicKey) throw new Error('publicKey no encontrada en la configuración');

            console.log('✅ Configuración de Wompi obtenida:', {
            hasPublicKey: !!config.publicKey,
            keyPrefix: config.publicKey.substring(0, 12),
            environment: config.environment || 'unknown'
            });

            // Generar firma de integridad
            const { data: sigResp, error: sigError } = await supabase.functions.invoke('generate-wompi-signature', {
            body: {
                reference: reference || orderId,
                amountInCents,
                currency: 'COP'
            }
            });

            console.log("🟢 Firma recibida del backend:", sigResp.signature);
            console.log("🟢 Datos enviados al checkout:", {
                reference: reference || orderId,
                amountInCents,
                currency: 'COP'
            });

            if (sigError || !sigResp?.signature) throw new Error('No se pudo generar la firma de integridad');

            // Limpiar y preparar datos
            const cleanPhone = billingAddress.phone.replace(/\D/g, '');
            const wompiCustomerData = {
            email: customerData.email.trim(),
            fullName: customerData.fullName.trim(),
            phoneNumber: cleanPhone,
            phoneNumberPrefix: '+57',
            legalId: customerData.legalId.toString().trim(),
            legalIdType: customerData.typeLegalId.trim()
            };

            const wompiShippingAddress = {
            addressLine1: billingAddress.address.trim(),
            city: billingAddress.city.trim(),
            region: billingAddress.state.trim(),
            country: 'CO',
            phoneNumber: cleanPhone
            };

            console.log('📦 Datos preparados para Wompi:', {
            amountInCents,
            reference: reference || orderId,
            publicKey: config.publicKey.substring(0, 15) + '...',
            customerData: wompiCustomerData,
            shippingAddress: wompiShippingAddress
            });

            // Configurar el checkout de Wompi
            const checkout = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents,
            reference: reference || orderId,
            publicKey: config.publicKey,
            redirectUrl: `${window.location.origin}/payment-confirmation?orderId=${orderId}&provider=wompi`,
            customerData: wompiCustomerData,
            shippingAddress: wompiShippingAddress,
            signature: sigResp.signature // 👈 Ahora sí con firma
            });

            console.log('🚀 Abriendo widget de Wompi...');

            checkout.open(async (result) => {
            setIsLoading(false);
            console.log('📊 Resultado de Wompi:', result);

            if (result.transaction.status === 'APPROVED') {
                console.log('✅ Pago aprobado');
                try {
                await supabase.functions.invoke('process-wompi-payment', {
                    body: {
                    orderId: orderId,
                    transactionId: result.transaction.id,
                    status: result.transaction.status,
                    reference: result.transaction.reference
                    }
                });
                } catch (processError) {
                console.error('Error al procesar pago aprobado:', processError);
                }

                window.location.href = `/payment-confirmation?orderId=${orderId}&status=success&provider=wompi&transactionId=${result.transaction.id}`;
            } else if (result.transaction.status === 'DECLINED') {
                console.log('❌ Pago rechazado');
                window.location.href = `/payment-confirmation?orderId=${orderId}&status=failed&provider=wompi`;
            } else {
                console.log('⏳ Pago pendiente o cancelado');
                window.location.href = `/payment-confirmation?orderId=${orderId}&status=pending&provider=wompi`;
            }
            });

        } catch (error) {
            console.error('❌ Error al procesar el pago con Wompi:', error);
            setError(error.message || 'Hubo un error al procesar el pago.');
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-2">
            <button
                onClick={handlePayment}
                disabled={isLoading || !isScriptLoaded || error !== null}
                className="w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-white to-gray-100 hover:from-gray-200 hover:to-gray-300 text-black font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Procesando pago...
                    </>
                ) : !isScriptLoaded ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Cargando Wompi...
                    </>
                ) : (
                    <>
                        <img src={LogoBancolombia} alt="Bancolombia" className="w-5 h-5" />
                        Pagar con Wompi
                    </>
                )}
            </button>
            
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default WompiButton;