const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Cooling Pads',
      'Water Pumps',
      'Motors',
      'Fans & Blowers',
      'Remote Controls',
      'Castor Wheels',
      'Filters',
      'Water Level Indicators',
      'Switches & Buttons',
      'Cooler Bodies',
      'Ice Chambers',
      'Other Parts'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  compatibility: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  }],
  specifications: {
    type: Map,
    of: String
  },
  warranty: {
    type: String,
    default: 'No warranty'
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update ratings when review is added
productSchema.methods.updateRatings = function() {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings.average = (sum / this.reviews.length).toFixed(1);
    this.ratings.count = this.reviews.length;
  } else {
    this.ratings.average = 0;
    this.ratings.count = 0;
  }
};

// Generate SKU automatically if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.sku = `${prefix}-${random}`;
  }
  next();
});

// Indexes for better query performance
// Compound/indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });

// Text index with weights to improve relevance for search queries
// Heavier weight on `name` and `brand`, moderate on `category`, `description` and `sku`.
productSchema.index({
  name: 'text',
  brand: 'text',
  category: 'text',
  description: 'text',
  sku: 'text',
  compatibility: 'text'
}, {
  weights: {
    name: 10,
    brand: 6,
    category: 4,
    sku: 8,
    description: 2,
    compatibility: 2
  },
  name: 'ProductTextIndex'
});

productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
