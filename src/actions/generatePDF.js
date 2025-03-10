import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import moment from 'moment';

/**
 * Generate PDF slip with appointment details
 * @param {Object} appointmentData - Appointment details
 * @param {String} qrCodeImage - Base64 encoded QR code image
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
const generatePDFSlip = async (appointmentData, qrCodeImage) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffer => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(err));

            // Add header
            doc.fontSize(20).text('Saylani Microfinance App', { align: 'center' });
            doc.fontSize(16).text('Appointment Slip', { align: 'center' });
            doc.moveDown();

            // Add token number
            doc.fontSize(14).text(`Token Number: ${appointmentData.tokenNumber}`, { align: 'center' });
            doc.moveDown();

            // Add appointment details
            doc.fontSize(12).text(`Date: ${moment(appointmentData.date).format('dddd, MMMM D, YYYY')}`);
            doc.fontSize(12).text(`Time: ${appointmentData.time}`);
            doc.fontSize(12).text(`Office Location: ${appointmentData.officeLocation}`);
            doc.moveDown();

            // Add applicant details
            doc.fontSize(12).text(`Applicant: ${appointmentData.applicantName}`);
            doc.fontSize(12).text(`CNIC: ${appointmentData.applicantCNIC}`);
            doc.fontSize(12).text(`Loan Category: ${appointmentData.loanCategory}`);
            doc.fontSize(12).text(`Loan Amount: PKR ${appointmentData.loanAmount.toLocaleString()}`);
            doc.moveDown();

            // Add QR code
            doc.image(qrCodeImage, {
                fit: [150, 150],
                align: 'center',
                valign: 'center'
            });
            doc.moveDown();

            // Add footer
            doc.fontSize(10).text('Please bring this slip along with your original CNIC and other supporting documents to the appointment.', { align: 'center' });
            doc.fontSize(10).text('For any queries, please contact our helpline at 0800-12345', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export default generatePDFSlip;