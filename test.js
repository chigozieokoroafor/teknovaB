const fs = require("fs");

// const fetch = require("node-fetch");    // <-- If you're not using Node v18+

const url = "http://localhost:3004"
const extra = "/admin/products";

const form = new FormData();

const file = fs.readFileSync(`C:/Users/OAUDA/Desktop/workspace/teknovaB/mulan.jpeg`, { encoding: "base64" })

const withprefix = 'data:image/png;base64,' + file

console.log(withprefix)

// console.log(withprefix)

// const file_stream = fs.createReadStream(`C:/Users/OAUDA/Desktop/workspace/teknovaB/mulan.jpeg`,)


// file_stream.on("error", (error) =>{
//     console.error(error)
// })

// form.append("name", "Product Name");
// form.append("discount", 10);
// form.append("price", 500000);
// form.append("colors", JSON.stringify(["Red", "Blue", "Black"]));
// form.append("description", "a dummy description");
// form.append("units", 10);
// form.append("specifications", JSON.stringify([
//   { "spec": "Size", "extraCost": 0 },
//   { "spec": "Memory", "extraCost": 20 },
//   { "spec": "Premium Finish", "extraCost": 15 }
// ]));

// form.append("file", withprefix)

// form.append("file", file_stream, "mulan.jpg");

// Note: createReadStream, not readFileSync


// const data = {
//     "name": "Product Name",
//     "discount": 10,
//     "price": 299.99,
//     "colors": ["Red", "Blue", "Black"],
//     "description": "This is a product description.",
//     "units": 50,
//     "specifications": [
//       {
//         "spec": "Size",
//         "extraCost": 0
//       },
//       {
//         "spec": "Memory",
//         "extraCost": 20
//       },
//       {
//         "spec": "Premium Finish",
//         "extraCost": 15
//       }
//     ],
//     file:withprefix
//   }




// fetch(url + extra, {
//   method: "POST",
//   body: JSON.stringify(data),
//   headers:{
//     "Content-Type":"application/json"
//   }

// })
// .then(async (response) => {
//   const data = await response.json();
//   console.log("response:::", data);
// })
// .catch((error) => {
//   console.log("error:::", error);
// });
