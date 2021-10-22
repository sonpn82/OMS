const Product = require('../models/product');  // product model import
const { Order, ProductOrder, CustomerOrder } = require('../models/order');  // order model import

module.exports.productRemainReport = async (req, res) => {

    const products = await Product.find({quantity_remain: {$gt: 0}});
    
    res.render('reports/productRemain', {products})
}

module.exports.saleDetailReport = async (req, res) => {

    let date = new Date;
    let startDate = new Date(date.getFullYear(), date.getMonth(), 2);
    let endDate = new Date(date.getFullYear(), date.getMonth()+1, 1);
    let totalSale = 0;
    let totalProfit = 0;
    let totalOrder = 0;
    let isDetail = true;   
    let monthList = [];
    let reportType = 'detail';
    let startTime = new Date().toISOString().slice(0, 7);
    let endTime = new Date().toISOString().slice(0, 7);

    const SaleSummary = {
        date: '1',
        sale: '0',
        profit: '0',
        orderNo: '0'
    }

    const saleSummary = [];
    
    if (req.body.startTime) {
        startTime = req.body.startTime;
        endTime = req.body.endTime;
        reportType = req.body.reportType;

        if (reportType === 'general') isDetail = false;
        
        const startYear = startTime.slice(0,4);
        const startMonth = startTime.slice(5,7);
        const endYear = endTime.slice(0,4);
        const endMonth = endTime.slice(5,7);

        startDateIn = new Date(startYear, startMonth-1, 2);
        endDateIn = new Date(endYear, endMonth, 1);      

        if (startDateIn > endDateIn) {
            req.flash('error', 'Tháng bắt đầu lớn hơn tháng kết thúc!')            
        } else {
            startDate = startDateIn;
            endDate = endDateIn;
            monthList = getMonthBetween(startYear, startMonth, endYear, endMonth);
        }
    }     
  
    const orders = await Order.find({
        $and: [{date: {$gte: startDate.toISOString(), $lte: endDate.toISOString()}},
               {close: true}]
    });    

    for (let i=0; i<orders.length; i++) {
        totalSale += orders[i].totalPrice;
        totalProfit += orders[i].profit;
        totalOrder += 1;     
    }  

    if (monthList.length) {
        for (let i=0; i< monthList.length; i++) {
            let sale = 0;
            let profit = 0;
            let orderNo = 0;

            for (let j=0; j< orders.length; j++) {
                const orderYear = orders[j].date.toISOString().slice(0,4);
                const orderMonth = orders[j].date.toISOString().slice(5,7);
                if (orderMonth + '-' + orderYear === monthList[i]) {                 
                    sale += orders[j].totalPrice;
                    profit += orders[j].profit;
                    orderNo += 1;                    
                }
            }

            data = Object.create(SaleSummary);
            data.date = monthList[i],
            data.sale = sale,
            data.profit = profit,
            data.orderNo = orderNo

            saleSummary.push(data);
        }
    }      

    res.render('reports/saleDetail', {orders, totalSale, totalProfit, totalOrder, isDetail, saleSummary, reportType, startTime, endTime})
}

const getMonthBetween = function(startYear, startMonth, endYear, endMonth) {
    // Return a list of month-year between selected period
    let monthList = [];

    startYear = parseInt(startYear);
    startMonth = parseInt(startMonth);
    endYear = parseInt(endYear);
    endMonth = parseInt(endMonth);

    monthList.push(startMonth < 10 ? '0'+ startMonth + '-' + startYear : startMonth + '-' + startYear);
    let year = startYear;
    let month = startMonth;
    
    while (year <= endYear) {
        if (year < endYear) {
            if (month < 12) {
                month += 1;
            } else {
                month = 1;
                year += 1;
            }       
            // input to list
            monthList.push(month < 10 ? '0'+ month + '-' + year : month + '-' + year);     
        } else {
            if (month < endMonth) {
                month += 1
                // input to list
                monthList.push(month < 10 ? '0'+ month + '-' + year : month + '-' + year)
            } else {
                break;
            }
        }          
    }

    return monthList;
}



