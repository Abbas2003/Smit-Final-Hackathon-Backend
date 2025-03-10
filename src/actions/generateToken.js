import moment from "moment";
import Appointment from "../models/Appointment.model.js";

/**
 * Generate token number for appointment
 * @param {Date} date - Appointment date
 * @returns {String} - Generated token number
 */
export const generateTokenNumber = async (date) => {
    const dateStr = moment(date).format('YYYYMMDD');
    const count = await Appointment.countDocuments({
        date: {
            $gte: moment(date).startOf('day'),
            $lte: moment(date).endOf('day')
        }
    });
    return `${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
};