const dotenv = require("dotenv");
dotenv.config();


var faunadb = require('faunadb'),
q = faunadb.query;


exports.handler = async (event, context) => {
    //only allow POST
    if (event.httpMethod !== "POST") {
       return { statusCode: 405, body: "Method Not Allowed" };
    }
  
    try {
        const messageBody = JSON.parse(event.body);                 //{ id: _____ }
        var adminClient = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });
    
        const result = await adminClient.query(
            q.Delete(
                q.Ref(q.Collection('messages'), messageBody.id)     //message id assigned
            )
        )

        return {
            statusCode: 200,
            body: JSON.stringify({ id: result.ref.id })             //sending newly created id
        }
    } catch (err) {
        return { statusCode: 500, body: err.toString() }
    }
}