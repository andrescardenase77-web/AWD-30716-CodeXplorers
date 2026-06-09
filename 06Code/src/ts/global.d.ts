declare var Vue: any;

interface Window {
    __PAYMENT__?: {
        id: string;
        patientID: string;
        amount: string | number;
        date: string;
        paymentType: string;
        paymentMethod: string;
    };
}
