const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    profilePic: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Fumio_Kishida_and_Prayut_Chan-o-cha_at_the_Prime_Minister%27s_Office_2022_%281%29_%28altered%29.jpg/250px-Fumio_Kishida_and_Prayut_Chan-o-cha_at_the_Prime_Minister%27s_Office_2022_%281%29_%28altered%29.jpg"
    }
}, {
    timestamps: true
});

const User = model("User", userSchema);
module.exports = User;