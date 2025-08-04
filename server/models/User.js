const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  
  // Profile information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Face recognition data
  faceDescriptor: {
    type: [Number],
    default: null
  },
  
  // Learning preferences
  preferences: {
    subjects: [{
      type: String,
      enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography']
    }],
    learningPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      default: 'moderate'
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    preferredQuestionTypes: [{
      type: String,
      enum: ['MCQ', 'coding', 'network', 'sql', 'chatbot']
    }],
    dailyGoal: {
      type: Number,
      default: 10,
      min: [1, 'Daily goal must be at least 1'],
      max: [100, 'Daily goal cannot exceed 100']
    }
  },
  
  // Progress tracking
  progress: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginMethod: {
    type: String,
    enum: ['email', 'face'],
    default: 'email'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for accuracy percentage
userSchema.virtual('accuracyPercentage').get(function() {
  if (this.progress.totalQuestions === 0) return 0;
  return Math.round((this.progress.correctAnswers / this.progress.totalQuestions) * 100);
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'preferences.subjects': 1 });
userSchema.index({ 'progress.points': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update progress
userSchema.methods.updateProgress = function(isCorrect) {
  this.progress.totalQuestions += 1;
  if (isCorrect) {
    this.progress.correctAnswers += 1;
    this.progress.points += 10;
  }
  
  // Update streak
  const today = new Date().toDateString();
  const lastActive = new Date(this.progress.lastActiveDate).toDateString();
  
  if (today === lastActive) {
    // Same day, no change to streak
  } else if (new Date(this.progress.lastActiveDate).getTime() + 86400000 >= new Date().getTime()) {
    // Consecutive day
    this.progress.streakDays += 1;
  } else {
    // Streak broken
    this.progress.streakDays = 1;
  }
  
  this.progress.lastActiveDate = new Date();
  return this.save();
};

// Method to get user stats
userSchema.methods.getStats = function() {
  return {
    totalQuestions: this.progress.totalQuestions,
    correctAnswers: this.progress.correctAnswers,
    accuracy: this.accuracyPercentage,
    streakDays: this.progress.streakDays,
    points: this.progress.points,
    lastActive: this.progress.lastActiveDate
  };
};

module.exports = mongoose.model('User', userSchema); 