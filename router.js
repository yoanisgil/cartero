/**
 * Created by ygil on 7/15/15.
 */

import kue from 'kue';
import bole from 'bole';
import express from 'express';
import validate from 'express-validation';
import joi from 'joi';
import kueFactory from './kue-factory';

let queue = kueFactory.createQueue();
let logger = bole('router');
let router = express.Router();


if (null != process.env.KUE_UI_LISTEN_PORT) {
    let uiListenPort = process.env.KUE_UI_LISTEN_PORT;
    let uiListenInterface = process.env.KUE_UI_LISTEN_INTERFACE || '127.0.0.1';

    kue.app.listen(uiListenPort, uiListenInterface);
}

let validationRules = {
    body: {
        email: joi.string().email().required(),
        subject: joi.string().required(),
        body_html: joi.string().required(),
        body_text: joi.string().required()
    }
}

/**
 * @apiDefine MissingEmailErrorExample
 * @apiErrorExample {json} Error-Response: Missing email
 *  HTTP/1.1 400 Bad Request
 *  {
 *    "status": 400,
 *    "statusText": "Bad Request",
 *    "errors": [
 *      {
 *        "field": "email",
 *        "location": "body",
 *        "messages": [
 *          "email" is required"
 *        ],
 *        "types": ["any.required"]
 *      }
 *    ]
 *  }
 */

/**
 * @api {post} /send-email Send Email
 * @apiName Send Email
 * @apiGroup Mailing
 * @apiVersion 1.0.0
 *
 * @apiParam {String} email The user to send the email to.
 * @apiParam {String} email The email subject.
 * @apiParam {String} body_html The html body of the email to be send.
 * @apiParam {String} body_text The text body of the email to be send.
 *
 * @apiExample {post} Example usage:
 *  {
 *    "email": "gil.yoanis@gmail.com",
 *    "subject": "hello",
 *    "body_html": "Hello world",
 *    "body_text": "Hello world"
 *  }
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": "200"
 *  }
 *
 * @apiUse MissingEmailErrorExample
 *
 * @apiSuccess (200) {String} status Operation result.
 */

let sendEmail = (req, res) => {
    let email = req.body.email;
    let subject = req.body.subject;
    let bodyHtml = req.body.body_html;
    let bodyText = req.body.body_text;

    queue.create('cr-email', {
        title: "send email",
        email: email,
        subject: subject,
        body_html: bodyHtml,
        body_text: bodyText
    }).attempts(process.env.ATTEMPTS || 5)
        .delay((process.env.DELAY || 0.5) * 1000)
        .backoff({type: 'exponential'})
        .save((err) => {
            if (!err) {
                logger.info("Created task to send email to %s", email);
                res.status(200).json({status: 200});
            } else {
                logger.error(err);
                res.status(500).json({status: 500, error: err})
            }
        });
}

router.post("/send-email", validate(validationRules), sendEmail);

module.exports = router;