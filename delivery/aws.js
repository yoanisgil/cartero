/**
 * Created by brujitos on 15-07-20.
 */

import aws from 'aws-sdk';

module.exports.send = (from, to, subject, bodyHtml, bodyText) => {
    aws.config.update({region: process.env.AWS_REGION});

    return new Promise((resolve, reject) => {
        let ses = new aws.SES({apiVersion: '2010-12-01'});

        let params = {
            Source: from,
            Destination: {
                ToAddresses: to
            },
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: bodyHtml
                    },
                    Text: {
                        Data: bodyText
                    }
                }
            }
        };

        ses.sendEmail(params, (error, data) => {
            console.log(error);
            (error) ? reject(error) : resolve(data);
        })
    });
}