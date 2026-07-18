const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPeriods = async (req, res) => {
    try {
        const periods = await prisma.rentalPeriod.findMany({ orderBy: { duration: 'asc' } });
        res.status(200).json({ success: true, data: periods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createPeriod = async (req, res) => {
    try {
        const { name, duration, unit } = req.body;
        const period = await prisma.rentalPeriod.create({
            data: { name, duration: parseInt(duration), unit: unit.toUpperCase() }
        });
        res.status(201).json({ success: true, data: period });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePeriod = async (req, res) => {
    try {
        await prisma.rentalPeriod.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete' });
    }
};

module.exports = { getPeriods, createPeriod, deletePeriod };
