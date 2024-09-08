const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { default: axios } = require("axios");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_KEY}@cluster0.fp5eepf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const SSLCommerzIntegration = client.db("SSLCommerzIntegration");
    const payment = SSLCommerzIntegration.collection("payment");

    app.post("/create-payment", async (req, res) => {
      const paymentInfo = req.body;

      console.log(paymentInfo);

      const trxId = new ObjectId().toString();

      const initiateData = {
        store_id: "firoz66b896582e8c8",
        store_passwd: "firoz66b896582e8c8@ssl",
        total_amount: paymentInfo.amount,
        currency: "BDT",
        tran_id: trxId,
        success_url: "http://localhost:5000/success-payment",
        fail_url: "http://localhost:5000/fail",
        cancel_url: "http://localhost:5000/cancel",
        ipn_url: "http://localhost:5000/cancel",
        cus_name: "Customer Name",
        cus_email: "cust@yahoo.com&",
        cus_add1: "Dhaka&",
        cus_add2: "Dhaka&",
        cus_city: "Dhaka&",
        cus_state: "Dhaka&",
        cus_postcode: 1000,
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        shipping_method: "NO",
        product_name: "Laptop",
        product_category: "Laptop",
        product_profile: "general",
        multi_card_name: "mastercard,visacard,amexcard",
        value_a: "ref001_A&",
        value_b: "ref002_B&",
        value_c: "ref003_C&",
        value_d: "ref004_D",
      };

      const response = await axios({
        method: "POST",
        url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        data: initiateData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const saveData = {
        cus_name: "Dumy",
        paymentId: trxId,
        amount: paymentInfo.amount,
        status: "Pending",
      };

      const save = await payment.insertOne(saveData);

      if (save) {
        res.send({
          paymentUrl: response.data.GatewayPageURL,
        });
      }
    });

    app.post("/success-payment", async (req, res) => {
      const successData = req.body;

      if (successData.status !== "VALID") {
        throw new Error("Unauthorized payment , Invalid Payment");
      }

      const query = {
        paymentId: successData.tran_id,
      };

      const update = {
        $set: {
          status: "Success",
        },
      };

      const updateData = await payment.updateOne(query, update);
      console.log("successData", successData);
      console.log("updateData", updateData);

      res.redirect("http://localhost:5173/success");
    });

    app.post("/fail", async (req, res) => {
      res.redirect("http://localhost:5173/fail");
    });

    app.post("/cancel", async (req, res) => {
      res.redirect("http://localhost:5173/cancel");
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    // "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("0171-sslcommerz-integration-server-module-75-practice");
});

app.listen(port, () => {
  console.log(
    `0171-sslcommerz-integration-server-module-75-practice listening on port ${port}`
  );
});
