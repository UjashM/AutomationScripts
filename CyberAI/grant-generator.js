let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\Grants.xlsx'); // parses a file
let grantlist = [];
let logos = ['ahrq.jpg', 'cdc.jpg', 'cdc.jpg', 'dhs.png', 'doc.png', 'dod.png', 'doe.png', 'doi.png', 'doj.png', 'dot.jpg', 'epa.png', 'nasa.png', 'nih.jpg', 'nrc.png', 'nsf.png', 'usaid.jpg', 'usda.png' ];
let agencies = ['Agency for Health Care Research and Quality', 'Centers for Disease Control - CGH', 'Centers for Disease Control - NCBDDD', 'Department of Homeland Security - FEMA','Department of Commerce',
'', 'Department of Energy', '', '', 'Department of Transportation', 'Environmental Protection Agency', 'National Aeronautics and Space Administration', 'National Institutes of Health',
'Nuclear Regulatory Commission', 'National Science Foundation', 'Agency for International Development', ''
];

function getDate(serial){

        let utc_days  = Math.floor(serial - 25569);
        let utc_value = utc_days * 86400;                                        
        let date_info = new Date(utc_value * 1000);
        return (parseInt(date_info.getMonth(),10) + 1) + '/' + (parseInt(date_info.getDate(),10) + 1) + '/' + date_info.getFullYear();//, 0, minutes, seconds);
}

class grant{
    constructor(title, logoName, agency, funding, postDate, closeDate, description, link){
        this.title = title;
        this.agency = agency;
        this.funding = (typeof funding == 'undefined' || funding == '')? 'N/A' : funding;
        this.postDate = (typeof postDate == 'undefined' || postDate == '')? 'N/A' : getDate(postDate);
        this.closeDate = (typeof closeDate == 'undefined' || closeDate == '')? 'N/A' : getDate(closeDate);
        this.description = (typeof description == 'undefined' || description == '')? '' :description;
        this.image = 'assets/images/federal-sponsor-logos/' + logoName.toLowerCase() + '.png';
        this.link = link;
    }
}

file[1].data.forEach(entry =>{
    if(!entry[0].includes('Link'))
    {
        grantlist.push(new grant(entry[3], entry[4],  entry[5], entry[6], entry[13], entry[14], entry[2], entry[0]));
    }});
fs.writeFileSync('C:\\Cyber-AI\\CyberAI\\data\\grants.json', JSON.stringify(grantlist));