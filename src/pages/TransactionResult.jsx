import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const SuccessIcon = () => (
    <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

const FailureIcon = () => (
    <div className="mx-auto bg-red-100 rounded-full h-20 w-20 flex items-center justify-center">
        <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </div>
);


const TransactionResult = () => {
    const [searchParams] = useSearchParams();
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const status = searchParams.get('bold-tx-status');
        const details = {
            reference: searchParams.get('bold-order-id'),
            status: status,
        };
        setTransactionDetails(details);
        setIsSuccess(status && status.toLowerCase() === 'approved');
    }, [searchParams]);

    if (!transactionDetails) {
        return <div className="flex items-center justify-center h-screen">Cargando resultado...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center">
                
                {isSuccess ? <SuccessIcon /> : <FailureIcon />}

                <h1 className="text-3xl font-bold mt-6">
                    {isSuccess ? '¡Pago Aprobado!' : 'El pago fue rechazado'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isSuccess 
                        ? 'Gracias por tu compra. Recibirás una confirmación por correo una vez que procesemos tu orden.'
                        : 'Tu pago no pudo ser procesado. Por favor, intenta de nuevo.'
                    }
                </p>

                <div className="mt-8 pt-6 border-t text-left space-y-3">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Estado:</span>
                        <span className={`font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {transactionDetails.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Referencia de Orden:</span>
                        <span>{transactionDetails.reference}</span>
                    </div>
                </div>

                <Link to="/" className="inline-block mt-8 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Volver a la tienda
                </Link>
            </div>
        </div>
    );
};

export default TransactionResult;