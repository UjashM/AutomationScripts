let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\List-of-Federal-Guidance.xlsm'); // parses a file
let federal_guidances = [];
let logoMap = new Map();

class federalGuidance{
    constructor(majorSponsor, sponsor, document, link, postedDate, logo, majorlogo){
        let currentDate = '5/6/20';
        let postDate = isNaN(postedDate)? postedDate: getDate(postedDate);
        this.majorSponsor = majorSponsor;
        this.sponsor = sponsor;
        this.document = isNaN(postedDate)? document : document + '(' + postDate + ')';
        this.link = link;
        this.logo = 'assets//logos//' + logo + '.png';
        this.majorlogo = 'assets//logos//' + majorlogo + '.png';
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
    if((typeof entry[0] != 'undefined') && (!entry[0].includes('Major Sponsor')))
    {
        logoMap.set(entry[1], entry[5]);
        let majorlogo = logoMap.get(entry[0]);
        federal_guidances.push(new federalGuidance(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], majorlogo));
    }
   });
fs.writeFileSync('C:\\COVID-19\\ujashm.github.io\\data\\federal-guidances.json', JSON.stringify(federal_guidances));