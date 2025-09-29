import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const SuccessIcon = () => (
    <div className="mx-auto bg-green-50 rounded-full h-20 w-20 flex items-center justify-center">
        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

const FailureIcon = () => (
    <div className="mx-auto bg-red-50 rounded-full h-20 w-20 flex items-center justify-center">
        <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </div>
);

const CancelledIcon = () => (
    <div className="mx-auto bg-yellow-50 rounded-full h-20 w-20 flex items-center justify-center">
        <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    </div>
);

const LoadingSpinner = () => (
    <div className="mx-auto bg-blue-50 rounded-full h-20 w-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const TransactionResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processTransactionResult = () => {
            // Verificar si es una transacción de Bold
            const boldStatus = searchParams.get('bold-tx-status');
            const boldOrderId = searchParams.get('bold-order-id');

            // Verificar si es una transacción de PayPal
            const paypalStatus = searchParams.get('paypal-tx-status');
            const paypalOrderId = searchParams.get('paypal-order-id');
            const paypalTransactionId = searchParams.get('paypal-transaction-id');

            let details = {};
            let success = false;
            let cancelled = false;
            let method = null;

            if (boldStatus && boldOrderId) {
                // Transacción de Bold
                method = 'bold';
                details = {
                    reference: boldOrderId,
                    status: boldStatus,
                    paymentMethod: 'Bold',
                    description: 'Pago procesado con tarjeta de crédito/débito',
                    icon: 'card'
                };
                success = boldStatus && boldStatus.toLowerCase() === 'approved';
            } else if (paypalStatus && paypalOrderId) {
                // Transacción de PayPal
                method = 'paypal';
                details = {
                    reference: paypalOrderId,
                    transactionId: paypalTransactionId,
                    status: paypalStatus,
                    paymentMethod: 'PayPal',
                    description: 'Pago procesado con PayPal',
                    icon: 'paypal'
                };
                success = paypalStatus && paypalStatus.toLowerCase() === 'approved';
                cancelled = paypalStatus && paypalStatus.toLowerCase() === 'cancelled';
            }

            // Si no hay parámetros válidos, programar redirección
            if (!method) {
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }

            setTransactionDetails(details);
            setIsSuccess(success);
            setIsCancelled(cancelled);
            setPaymentMethod(method);
            setIsLoading(false);
        };

        // Pequeño delay para mostrar loading
        const timer = setTimeout(processTransactionResult, 1000);
        return () => clearTimeout(timer);
    }, [searchParams, navigate]);

    const getStatusMessage = () => {
        if (isSuccess) {
            return {
                title: '¡Pago Aprobado!',
                message: 'Gracias por tu compra. Recibirás una confirmación por correo una vez que procesemos tu orden.',
                statusColor: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        } else if (isCancelled) {
            return {
                title: 'Pago Cancelado',
                message: 'Has cancelado el proceso de pago. Puedes intentar nuevamente cuando desees.',
                statusColor: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200'
            };
        } else {
            return {
                title: 'El pago fue rechazado',
                message: 'Tu pago no pudo ser procesado. Por favor, intenta de nuevo o usa otro método de pago.',
                statusColor: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }
    };

    const getIcon = () => {
        if (isLoading) return <LoadingSpinner />;
        if (isSuccess) return <SuccessIcon />;
        if (isCancelled) return <CancelledIcon />;
        return <FailureIcon />;
    };

    const PayPalIcon = () => (
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="#003087">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.5.5 0 0 1-.5-.5v-.5c0-.276.224-.5.5-.5s.5.224.5.5v.5a.5.5 0 0 1-.5.5z"/>
        </svg>
    );

    const CardIcon = () => (
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H2zm20 2v2H2V6h20zm-20 6h20v6H2v-6zm2 2v2h4v-2H4zm6 0v2h4v-2h-4z"/>
        </svg>
    );

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
                    <LoadingSpinner />
                    <h2 className="mt-6 text-xl font-semibold">Procesando resultado del pago...</h2>
                    <p className="mt-2 text-gray-600">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    if (!transactionDetails || !transactionDetails.reference) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
                    <div className="mx-auto bg-yellow-50 rounded-full h-20 w-20 flex items-center justify-center">
                        <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mt-6">Información de pago no disponible</h1>
                    <p className="text-gray-600 mt-2 mb-6">
                        No pudimos obtener la información del pago. Serás redirigido al inicio.
                    </p>
                    <Link to="/" className="inline-block bg-blue-100 text-black font-bold py-3 px-6 rounded-lg hover:bg-blue-200 transition-colors">
                        Ir al inicio
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusMessage();

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center">
                
                {getIcon()}

                <h1 className="text-3xl font-bold mt-6">
                    {statusInfo.title}
                </h1>
                <p className="text-gray-600 mt-2">
                    {statusInfo.message}
                </p>

                {transactionDetails.description && (
                    <p className="text-sm text-gray-500 mt-1">{transactionDetails.description}</p>
                )}
                
                {isSuccess && (
                    <div className={`mt-4 p-3 ${statusInfo.bgColor} rounded-lg border ${statusInfo.borderColor}`}>
                        <p className="text-sm text-green-700 font-medium">
                            ✓ Tu orden será procesada en las próximas 24 horas
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Recibirás confirmación por email con los detalles de envío
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t text-left space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-500">Estado:</span>
                        <span className={`font-bold ${statusInfo.statusColor}`}>
                            {transactionDetails.status?.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-500">Referencia de Orden:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {transactionDetails.reference}
                        </span>
                    </div>
                    {transactionDetails.transactionId && (
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">ID de Transacción:</span>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {transactionDetails.transactionId}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-500">Método de Pago:</span>
                        <span className="flex items-center">
                            {transactionDetails.paymentMethod === 'PayPal' ? <PayPalIcon /> : <CardIcon />}
                            {transactionDetails.paymentMethod}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-500">Fecha:</span>
                        <span className="text-sm">
                            {new Date().toLocaleDateString('es-CO', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Link 
                        to="/compras" 
                        className="flex-1 inline-block bg-blue-100 text-black font-bold py-3 px-6 rounded-lg hover:bg-blue-200 transition-colors text-center"
                    >
                        Volver a la tienda
                    </Link>
                    
                    {!isSuccess && !isCancelled && (
                        <Link 
                            to="/checkout" 
                            className="flex-1 inline-block bg-gray-100 text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center"
                        >
                            Intentar de nuevo
                        </Link>
                    )}
                    
                    {isCancelled && (
                        <Link 
                            to="/checkout" 
                            className="flex-1 inline-block bg-yellow-100 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-200 transition-colors text-center"
                        >
                            Continuar compra
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionResult;