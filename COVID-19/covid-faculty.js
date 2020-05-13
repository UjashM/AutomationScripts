let fs = require('fs');
let xlsx = require('node-xlsx');
let facultyfile = xlsx.parse('C:\\Users\\ujash\\Downloads\\Covid-19-Faculty.xlsx'); // parses a file
let dirpath = 'C:\\COVID-19\\ujashm.github.io\\assets\\images\\faculty\\';
let facultyList = [];

let getResearchInterest = function(keywords){
    let researchInterests = '';
    for(let i = 0; i < keywords.length; i++)
    {
        if(undefined!== keywords[i] && keywords[i]!= '')
        {

                researchInterests += keywords[i] + '; ';
        }
    }
    researchInterests = (researchInterests != '')? researchInterests : 'N/A';
    researchInterests = (researchInterests.charAt(researchInterests.length-2) == ';')? researchInterests.substring(0, researchInterests.length-2)
    :researchInterests;
    return researchInterests;
}

let getCovidProjects = function(projectlist){
    let covidlist = [];
    let incorrectInterest = ['n/a', 'none'];
    for(let i = 0; i < projectlist.length; i++)
    {
        if(undefined!== projectlist[i] && projectlist[i]!= '' && 
        incorrectInterest.indexOf(projectlist[i].toLowerCase()) == -1)
        {
            covidlist.push(projectlist[i]);
        }
    }
    return covidlist;
}

class faculty{
    constructor(title, school, department,  lastName, firstName, email, contact, researchInterest, researchDescription, onlineCV, facultyLink, researchGate, googleScholar, otherlink,photo, covidProjects){
        this.title = (title !== undefined)? title : 'Professor';
        
        this.school = school;
        this.department = (department !== undefined)? department : 'Other Department';
        this.fullName = firstName + ' ' + lastName;
        this.lastName = lastName;
        this.email = (email !== undefined)? email : 'N/A';
        this.contact = (contact !== undefined)? contact : 'N/A';
        this.researchInterest = getResearchInterest(researchInterest);
        //console.log(this.researchInterest);
        
        this.researchDescription = researchDescription;
        this.facultyLink = facultyLink;
        this.photo = (typeof photo == 'undefined' || photo == '')? 'placeholder' : photo;
        let filepath = dirpath + this.photo + '.jpg';
        this.photo = fs.existsSync(filepath)? 'assets\\images\\Faculty\\' + this.photo + '.jpg' : '';
        this.covidProjects = getCovidProjects(covidProjects);
        this.onlineCV = onlineCV;
        this.researchGateProfile = researchGate;
        this.googleScholarProfile = googleScholar;
        this.otherProfile  = otherlink;
    }
}

facultyfile[0].data.forEach(element =>{
    if(undefined!== element[0] && !element[0].includes('CAMPUS_TITLE'))
    {
        
        facultyList.push(new faculty(element[0], element[1], element[3], element[4], element[5], element[6], element[7],  [element[8], element[9], element[10], element[11], element[12], element[13]
            , element[14]], element[15], element[16], element[17], element[18], element[19], element[20], element[21], [element[22], element[23], element[24], element[25], element[26]]));
    }});


fs.writeFileSync('C:\\COVID-19\\ujashm.github.io\\data\\covid-faculty.json', JSON.stringify(facultyList));