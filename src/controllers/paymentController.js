
require("dotenv").config()

const { updateTransaction } = require("../db/querys/transactions");
const { catchAsync } = require("../errorHandler/allCatch");
const { PARAMS } = require("../util/consts");

const paystackSecret = process.env.PAYSTACK_SECRET

exports.paymentWebhook = catchAsync(async (req, res)=>{
    
    const hash = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(req.body)).digest('hex');

    if (hash != req.headers['x-paystack-signature']) {
        return generalError(res, "Lmao, transaction unverified.")
    }
    // console.log("recieved:::webhook", req.body )
    success(res, {}, "Recieved")
    
    try{
        const data = req.body;
        if (data.event == "charge.success"){      
            
            const update = await updateTransaction({status:"Success"}, data.data.metadata[PARAMS.orderId])
            
            console.log("Transaction update::::",update, "::::trx::::ref", data.data.reference)

            // const booking = await getSpecificBooking(event.data?.metadata?.bookingId)
            // // console.log("buffer::::",booking.resume_buffer)
            // // console.log("fileName:::", `${event.data?.metadata?.name}.${booking.resume_mimetype}`)

            // notifier.emit(notification_events.sendMailInterviewer, booking.resume_buffer, event.data?.metadata?.time, event.data?.metadata?.date, event.data?.metadata?.name, event.data?.customer?.email, `${event.data?.metadata?.name}.${booking.resume_mimetype}`, booking.notes)

            // notifier.emit(notification_events.sendMailSeeker, event.data?.customer?.email, event.data?.metadata?.name.split(" ")[0], event.data?.metadata?.date, event.data?.metadata?.time)
            
        }



    }
    catch(error){
        console.log("error::paystackWebhook:::", error)
    }
})