const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAttributes = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany({
            include: { values: true }
        });
        res.status(200).json({ success: true, data: attributes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createAttribute = async (req, res) => {
    try {
        const { name, displayType, values } = req.body; // values is array of strings or objects?

        // Create attribute
        const attribute = await prisma.attribute.create({
            data: {
                name,
                displayType,
                // Nested create for values if provided as array of strings
                values: {
                    create: values ? values.map(v => ({ value: v })) : []
                }
            },
            include: { values: true }
        });
        res.status(201).json({ success: true, data: attribute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add value to existing attribute
const addAttributeValue = async (req, res) => {
    try {
        const { attributeId } = req.params;
        const { value } = req.body;
        const attrValue = await prisma.attributeValue.create({
            data: { attributeId, value }
        });
        res.status(201).json({ success: true, data: attrValue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAttributes, createAttribute, addAttributeValue };
