import QRCode from 'qrcode';
/**
 * Generate QR code for appointment
 * @param {String} data - Data to encode in QR code
 * @returns {Promise<String>} - Base64 encoded QR code image
 */
export const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(data);
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};