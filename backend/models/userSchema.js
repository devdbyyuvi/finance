const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
}
const userSchema = new mongoose.Schema({
    firstName: reqString,
    lastName: reqString,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
module.exports = User;