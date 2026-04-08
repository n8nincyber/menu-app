const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      index: true,
    },
    normalizedName: {
      type: String,
      index: true,
    },
    sourceImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: generate normalized name for fuzzy matching
restaurantSchema.pre('save', function (next) {
  this.normalizedName = this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  next();
});

// Text index for search
restaurantSchema.index({ name: 'text', normalizedName: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
