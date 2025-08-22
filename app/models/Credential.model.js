const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      passwordHash: { type: String, required: true },
   },
   { timestamps: true }
);

module.exports = mongoose.model('Credential', CredentialSchema);
