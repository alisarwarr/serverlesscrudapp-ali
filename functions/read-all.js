const dotenv = require("dotenv");
dotenv.config();


var faunadb = require('faunadb'),
q = faunadb.query;


exports.handler = async (event, context) => {
    try {
        var adminClient = new faunadb.Client({ secret: process.env.FAUNADB_ADMIN_SECRET });
    
        const result = await adminClient.query(
            q.Map(
                q.Paginate(q.Documents(q.Collection('messages'))),
                q.Lambda(x => q.Get(x))
            )
        )

        const modifiedData = result.data.map(obj => {
            return { id: obj.ref.id }                   //array holding 'id' only
        })
    
        console.log(JSON.stringify(modifiedData));      //showing result

        return {
            statusCode: 200,
            body: JSON.stringify(modifiedData)          //sending result
        }
    } catch (err) {
        return { statusCode: 500, body: err.toString() }
    }
}