let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\COVID-19-Funding-Opportunities.xlsx'); // parses a file
let opportunities = [];

class Opportunity{
    constructor(title, agency, logo, category, subCategory,  dueDate, fundingLevel, website, description){
        let currentDate = '5/11/20';
        this.title = title;
        this.agency = agency;
        this.logo = 'assets//logos//' + logo + '.png';
        this.category = category;
        this.subCategory = subCategory;
        this.dueDate = isNaN(dueDate)? dueDate: getDate(dueDate);
        this.fundingLevel = fundingLevel;
        this.website = website;
        this.description = description;
        this.updateddate = currentDate;/*(currentDate.getMonth(currentDate)+1) + '/' + currentDate.getDate(currentDate)
        + '/' + currentDate.getFullYear(currentDate); 
        console.log(this.updateddate);*/
    }
}

function getDate(serial){
    let utc_days  = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    return (parseInt(date_info.getMonth(),10) + 1) + '/' + (parseInt(date_info.getDate(),10) + 1) + '/' + date_info.getFullYear();//, 0, minutes, seconds);
}


file[0].data.forEach(entry =>{
    if((typeof entry[0] != 'undefined') && (!entry[0].includes('Title')))
    {
        opportunities.push(new Opportunity(entry[0], entry[1], entry[2], entry[4], entry[5], entry[6], entry[7], entry[8], entry[9]));
    }
   });
fs.writeFileSync('C:\\COVID-19\\ujashm.github.io\\data\\funding-opps.json', JSON.stringify(opportunities));