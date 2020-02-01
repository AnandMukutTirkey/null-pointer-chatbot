'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var request = require('request')
const app = express().use(bodyParser.json()); // creates http server
const token = 'VERIFICATION_TOKEN'; // type here your verification token
var regAccounts = new Map([['8527614265', 5000], ['7665466329', 10000]])
var inProgressAccounts = new Map([['8875636629', '5']])
var accountNumber = null;
var sessionData = {}
app.listen(3000, () => console.log('[ChatBot] Webhook is listening'));


app.post('/', (req, res) => {
    // check if verification token is correct
    console.log(req.body);
    console.log(sessionData)
    if (req.query.token !== token) {
        return res.sendStatus(401);
    }
    var responseString = null;
    var intent = req.body.queryResult.intent["displayName"]
    accountNumber = req.body.queryResult.parameters["AccountNo"]
    var session = req.body.session
    
    if (null != accountNumber){
        sessionData[session] = session[session] || []
        sessionData[session][0] = accountNumber.toString()
    }
    switch (intent) {

        case 'balanceEnquiry.otp':
        case 'balanceEnquiry.mobileNumber.otp':
            if (sessionData[session][1] !== null && sessionData[session][0] !== null) {
                if (req.body.queryResult.parameters["otp"] == sessionData[session][1]) {
                    console.log(sessionData[session][0])
                    console.log(regAccounts)
                    if (regAccounts.has(sessionData[session][0])) {
                        responseString = "Your account balance is Rs." + regAccounts.get(sessionData[session][0]);
                    } else if (inProgressAccounts.has(sessionData[session][0])) {
                        responseString = "Your account opening process is in progress, you will be able use your account in " + inProgressAccounts.get(sessionData[session][0]) + " days";
                    } else {
                        responseString = "You don't have Airtel Payments Bank acount, get a new oneby following command: crearte an account.."
                    }

                } else {
                    console.log(`original otp ${sessionData[session][1]}, entered otp ${req.body.queryResult.parameters["otp"]}`)
                    responseString = "Invalid otp";
                }

            } else {
                responseString = "Something went wrong"
            }
            break;
        case 'accountOpeningEnquiry.otp':
            console.log(sessionData)
            if (sessionData[session][1] !== null && sessionData[session][0] !== null) {
                if (req.body.queryResult.parameters["otp"] == sessionData[session][1]) {
                    if (regAccounts.has(sessionData[session][1])) {
                        responseString = "Your account is ready to use";
                    } else if (inProgressAccounts.has(sessionData[session][0])) {
                        responseString = "Your account opening process is in progress, you will be able use your account in " + inProgressAccounts.get(sessionData[session][0]) + " days";
                    } else {
                        responseString = "You don't have Airtel Payments Bank acount, get a new one by following command: crearte an account."
                    }

                } else {
                    console.log(`original otp ${sessionData[session][1]}, entered otp ${req.body.queryResult.parameters["otp"]}`)
                    responseString = "Invalid otp";
                }

            } else {
                responseString = "Something went wrong"
            }
            break;
        case 'cardNumberEnquiry':
            if (sessionData.get(req.body.session).get(1) !== null && sessionData.get(req.body.session)[0] !== null) {
                if (req.body.queryResult.parameters["otp"] === sessionData.get(req.body.session).get(1)) {
                    if (regAccounts.has(sessionData.get(req.body.session)[0])) {
                        responseString = "Your debit card Number is " + sessionData.get(req.body.session)[0] + "4321";
                    } else if (inProgressAccounts.has(sessionData.get(req.body.session)[0])) {
                        responseString = "Your account opening process is in progress, you will be able use your debit card in " + inProgressAccounts.get(sessionData.get(req.body.session)[0]) + " days";
                    } else {
                        responseString = "You don't have Airtel Payments Bank acount, get a new one by following command: crearte an account. @<link>"
                    }

                } else {
                    console.log(`original otp ${sessionData[session][1]}, entered otp ${req.body.queryResult.parameters["otp"]}`)
                    responseString = "Invalid otp";
                }

            } else {
                responseString = "Something went wrong"
            }
        case 'sendMoney.otp':
            if (sessionData.get(req.body.session).get(1) !== null && sessionData.get(req.body.session)[0] !== null) {
                if (req.body.queryResult.parameters["otp"] === sessionData.get(req.body.session).get(1)) {
                    if (regAccounts.has(sessionData.get(req.body.session)[0])) {
                        if (regAccounts.get(sessionData.get(req.body.session)[0]) - req.body.queryResult.parameters["Amount"] < 0) {
                            responseString = "You have insufficient balance please load balance by following command: add money";
                        } else {
                            if (regAccounts.has(req.body.queryResult.parameters["toMobileNo"])) {
                                regAccounts.set(req.body.queryResult.parameters["toMobileNo"], regAccounts.get(req.body.queryResult.parameters["toMobileNo"]) + req.body.queryResult.parameters["Amount"])
                                regAccounts.set(sessionData.get(req.body.session)[0], regAccounts.get(sessionData.get(req.body.session)[0]) - req.body.queryResult.parameters["Amount"])
                                responseString = "Money transferred successfully"
                            } else {
                                responseString = "You cannot transfer money as toAccount does not exist"
                            }

                        }
                    } else if (inProgressAccounts.has(sessionData.get(req.body.session)[0])) {
                        responseString = "Your account opening process is in progress, you will be able use your debit card in " + inProgressAccounts.get(sessionData.get(req.body.session)[0]) + " days";
                    } else {
                        responseString = "You don't have Airtel Payments Bank acount, get a new one by following command: crearte an account. @<link>"
                    }

                } else {
                    console.log(`original otp ${sessionData[session][1]}, entered otp ${req.body.queryResult.parameters["otp"]}`)
                    responseString = "Invalid otp";
                }

            } else {
                responseString = "Something went wrong"
            }
        case 'addMoney.cardNumber.password':
        case 'addMoney.cardNumber.password.mobileNumber':
            console.log(sessionData); //console.log(typeof sessionData[session][0] !== 'undefined' )
            if (null != sessionData[session] && typeof sessionData[session][0] !== 'undefined' && sessionData[session][0] !== null) {
                if (regAccounts.has(sessionData[session][0])) {
                    regAccounts.set(sessionData[session][0], regAccounts.get(sessionData[session][0]) + req.body.queryResult.parameters["amount"])
                    responseString = `Your have added money successfully. Your current balance is ${regAccounts.get(sessionData[session][0])}`;
                } else if (inProgressAccounts.has(sessionData[session][0])) {
                    responseString = "Your account opening process is in progress, you will be able use your debit card in " + inProgressAccounts.get(sessionData[session][0]) + " days";
                } else {
                    responseString = "You don't have Airtel Payments Bank acount, you can create one account here"
                }
            } else {
                responseString = "Please provide account number";
            }
            break;

        case 'rechargeDTH':
            responseString = "recharge done";
            break;
        case 'rechargeMobile':
            responseString = "recharge done";
            break;
        case 'createAccount.name.dob.id.mobile':
            if (regAccounts.has(req.body.queryResult.parameters["mobile"])) {
                responseString = "Your Account already exists"
            } else {
                regAccounts.set(req.body.queryResult.parameters["mobile"], 0)
                responseString = "Account created successfully"
            }
            break;
        default:
            if (accountNumber !== null) {
                var myOtp = otp(accountNumber);
                console.log(`returned otp is ${myOtp}`)
                if (myOtp !== 'retry') {
                    //if (null != sessionData.get(req.body.session) && sessionData.get(req.body.session)[1] === null)
                    sessionData[session][1] = myOtp;

                    console.log(sessionData)
                    responseString = `verify the otp sent to ${accountNumber}`;
                } else{
                    responseString = 'Retry';
                }
            } else {
                responseString = "Please provide your account number";
            }
            break;
    }
    // print request body

    // return a text response
    const data = {
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [
                        {
                            "simpleResponse": {
                                "textToSpeech": responseString
                            }
                        }
                    ]
                }
            }
        }
    }

    res.json(data);
});

var user = {
    balancevar: 99999,
    balance: function () {
        return "Your balance is Rs." + this.balancevar;
    }
};

function otp (AccountNo) {
    const myOtp = Math.floor(100000 + Math.random() * 900000);
    var otpUrl = `http://sms.dataoxytech.com/index.php/smsapi/httpapi/?uname=sylvester007&password=forskmnit&sender=FORSKT&receiver=${AccountNo}&route=TA&msgtype=1&sms=${myOtp}`;
    console.log(`otp url ${otpUrl}`)
    request.get(otpUrl, function (err, res, body) { });
    return myOtp
}