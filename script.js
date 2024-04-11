// Configuration data
const config = {
  domain: "rewardscenter.club",
  APIKey: "1cc2f734-9d18-48cc-81f6-5b2801fea8d2",
  capture_delay: 0,
  MerchantID: "0",
  buildorder: 1,
};

// Get the form and the response element
const form = document.getElementById("payment-form");
const responseElement = document.getElementById("response");

// Add an event listener for the form submission
form.addEventListener("submit", async (e) => {
  // Prevent the form from submitting normally
  e.preventDefault();

  // Get the input data from the form
  const inputData = {
    card_num: document.getElementById("card-num").value,
    card_expm: document.getElementById("card-expm").value,
    card_expy: document.getElementById("card-expy").value,
    card_cvv: document.getElementById("card-cvv").value,
    CustomerFirstName: document.getElementById("first-name").value,
    CustomerLastName: document.getElementById("last-name").value,
    BillingStreetAddress: document.getElementById("billing-address").value,
    BillingCity: document.getElementById("billing-city").value,
    BillingState: document.getElementById("billing-state").value,
    BillingZipCode: document.getElementById("billing-zip").value,
    Email: document.getElementById("email").value,
    BillingHomePhone: document.getElementById("phone").value,
    amount: parseFloat(document.getElementById("amount").value), // convert to decimal
    ProductCount: parseInt(document.getElementById("product-count").value, 10), // convert to integer
    productid_1: parseInt(
      document.querySelector('input[name="productid_1"]:checked').value,
      10
    ), // convert to integer
  };

  // Merge the configuration data and the input data
  const data = { ...config, ...inputData };

  // Print the data on the screen
  console.log(data);

  // Send the data to the backend
  try {
    const response = await axios.post("/api/process", data);

    // Display the response from the backend
    responseElement.textContent = JSON.stringify(response.data, null, 2);
  } catch (error) {
    // Display the error message if the request fails
    responseElement.textContent = `Error: ${error.message}`;
  }
});
