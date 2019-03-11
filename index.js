var fs = require("fs");
const parse = require("csv-parse");
const moment = require("moment");
const find = require("lodash/find")

var inputFile='sampledata.tsv';

var customerData = {};

// originally I was hoping to use streams to parallelize the record processing
// however, the output data structure is dependent on interactions between rows
// so, I decided it would be much easier to keep the whole output in memory
fs.createReadStream(inputFile)
  // tab delimeter, better quote escaping, and skip the header row
  .pipe(parse({delimiter: '\t', relax: true, from: 2}))
  // run on each row of data from the tsv
  .on('data', function(csvrow) {
      const customerName = csvrow[6]
      const orderId = csvrow[1]
      // probably overkill to use moment for date parsing here
      // but it makes formatting and consistent date handling much simpler
      const orderDate = moment(csvrow[2],"M/D/YY")
      // moment assumes the current time on parse, so set to midnight
      const formattedOrderDate = orderDate.set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DDTHH:mm:ss')
      const productId = csvrow[13]
      const category = csvrow[14]
      const subCategory = csvrow[15]
      const baseUrl = "https://www.foo.com"
      // escaping the url parts mostly to elimiate spaces
      const productUrl = `${baseUrl}/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}/${encodeURIComponent(productId)}`
      const revenue = parseFloat(csvrow[17])

      // date filtering, only process if after July 31st, 2016
      if (orderDate.isBefore('2016-07-31')) {
        return
      }

      // Customer Name is the key in the output data, so check if they exist and create if not
      let existingCustomer = customerData[customerName]
      if (!existingCustomer) {
        existingCustomer = customerData[customerName] = {
          "orders": [
          ]
        }
      }

      // similarly, check for orders with the same Order ID, create if missing
      let existingOrder = find(customerData[customerName].orders, {order_id: orderId})
      if (!existingOrder) {
        existingOrder = {
            "order_id": orderId,
            "order_date": formattedOrderDate,
            "line_items": [
            ]
        }
        existingCustomer.orders.push(existingOrder)
      }

      // finally add the current line item
      existingOrder.line_items.push(
        {
            "product_url": productUrl,
            "revenue": revenue
        }
      )

    })
    // once all rows are processed, output the JSON data to stdout
    .on('end',function() {
      console.log(JSON.stringify(customerData, null, 4));
    });
