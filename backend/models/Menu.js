const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Veg', 'Non-Veg', 'Beverages', 'Desserts']
    },
    subCategory: {
        type: String,
        enum: ['Appetizer', 'Main Course', 'Rice', 'Breads', 'Soups', 'Curries']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to set isVeg based on category
menuSchema.pre('save', function(next) {
    this.isVeg = this.category === 'Veg';
    next();
});

module.exports = mongoose.model('Menu', menuSchema);