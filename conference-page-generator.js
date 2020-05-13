const fs = require('fs');
const path = require('path');
const https = require('https');
const readXlsxFile = require('read-excel-file/node');
const fetch = require('node-fetch');
const sleep = require('system-sleep');
const imageFolderLocation = 'https://rise2019.org/img/Speakers/';
const targetlocationFolder = 'C:\\xampp\\htdocs\\RISE 2019\\RISE2019\\';
const excelfilepath = 'C:\\Users\\ujash\\Downloads\\Master Contact List.xlsx';// needs to change
const conference_page_attributes = ["First Name", "Last Name", "Title", "Institution","Role", "Session", "Session Title", "Start Time", "End Time", "Day","Session Link", "Type", "Venue", "Panel Description", "Website Title", "Bio"];
var attributesMap = new Map();
const template = fs.readFileSync('C:\\Automation Scripts\\rise-session-template.html').toString();//needs to change
const speaker_template = fs.readFileSync('C:\\Automation Scripts\\speaker_template.html').toString();// needs to change
const rise_speaker_template = fs.readFileSync('C:\\Automation Scripts\\rise-speakers-template.html').toString();//needs to change
const welcome_sessions_roles = ["Welcome from the University at Albany", "Welcome from the Honorary Chairs (SUNY)", "Welcome from NCSE", "Welcome from Program Chairs"];
const session_types = ["Leader's Roundtable", "Plenary","Cohort Breakouts", "Panel Discussion", "Armchair discussion", "Film Screening", "Opening", "Keynote Address", "Cohort Report"];
const welcome_panelist_order = [2,0,3,1]; // Order for welcome panelist precedence as per their last name

function Session(day, startTime, endTime, sessionType, sessionTitle1, sessionTitle2, sessionLink, venue, description)
{
    this.day = day;
    this.startTime = convertToTime(startTime);
    this.endTime = convertToTime(endTime);
    this.sessionType = sessionType;
    this.sessionTitle1 = (sessionTitle1 == null)? "": sessionTitle1;
    this.sessionTitle2 = (sessionTitle2 == null)? "" : sessionTitle2;
    this.title = (sessionTitle2 == null)? sessionTitle1: sessionTitle1.concat(": ", sessionTitle2);
    this.link = sessionLink;
    this.venue = (venue == null)? "Campus Center": venue;
    this.description = (description == null)? "": description;
    this.Panelists = [];
    this.addPanelist = function(firstName, lastName, link,  bio, title, institution, role){
        this.Panelists.push(new Panelist(firstName, lastName, link, bio, title, institution, role));
    }
}

function convertToTime(timeString)
{
    timeString = timeString * 24;
    var time = timeString.toString().split('.');
    var hour = (time[0] != 12) ? time[0] % 12: time[0];
    var minutes = (time[1] == undefined)? "00": (Math.round(time[1]*60)).toString().substring(0,2);
    var format = (time[0] >= 12) ? " PM" : " AM";  
    return (hour + ":" + minutes + format) 
}

function Panelist(firstName, lastName, link, bio, title, institution, role)
{
    this.name = firstName.concat(" ", lastName);
    this.link = link;
    this.bio = bio;
    this.title = (title == null)? "": title;
    this.institution = (institution == null)?"": institution;
    this.role = role;
}

readXlsxFile(excelfilepath, {sheet: 'By Panel'}).then((rows)=>{
    let Sessions = [];
    let Panelists = [];
    //Mapping attributes
    mapAttributes(rows[0]);
    //sorting array of arrays based on sessionlinks
    sortRowsOnSessionLink(rows);
    //Map Panelists to Sessions
    mapPanelistsToSession(Sessions, rows, Panelists);
    //Sort Panelists in Sessions by Last Name
    sortPanelistsByLastName(Sessions);
    //Delete program files
    console.log('Deleting Program Files');
    deleteFolderFiles(targetlocationFolder.concat("programs\\"));
    //Delete speaker files
    console.log('Deleting Speakers Files');
    deleteFolderFiles(targetlocationFolder.concat("speakers\\"));
    //Generate HTML files for Penalists
    console.log('Creating Speakers Files');
    createPanelistfiles(Sessions);
    //Generate HTML files for sessions
    console.log('Creating Session Files');
    createSessionfiles(Sessions);
    //Create Speakers page
    console.log('Creating RISE Speakers Pages');
    createSpeakersPage(Panelists);
    console.log('Creating Agenda Pages');
    createAgendaPages(Sessions);
})

function mapAttributes(row)
{
    for(attribute_count=0; attribute_count < row.length; attribute_count++)
    {
        if(conference_page_attributes.includes(row[attribute_count]))
        {
            attributesMap.set(row[attribute_count], attribute_count);
        }
    }
}

function sortRowsOnSessionLink(rows)
{
    for(var i=0; i< rows.length; i++ )
    {
        for(var j = 0; j< rows.length - (i+1); j++)
        {   
            var sessionLink1 = rows[j][attributesMap.get("Session Link")];
            var sessionLink2 = rows[j+1][attributesMap.get("Session Link")];
            if(sessionLink1 > sessionLink2 || sessionLink1 == null)
            {
              var swap = rows[j];
              rows[j]= rows[j+1];
              rows[j+1] = swap;
            }
        }
    }
}

function sortPanelistsByLastName(Sessions)
{
for(sessionCount = 0; sessionCount < Sessions.length; sessionCount++)
{
    for(var i=0; i< Sessions[sessionCount].Panelists.length; i++ )
    {
        for(var j = 0; j< Sessions[sessionCount].Panelists.length - (i+1); j++)
        {   
            var panelist1 =  Sessions[sessionCount].Panelists[j];
            var panelist2 =  Sessions[sessionCount].Panelists[j+1];
            if(panelist1.lastName > panelist2.lastName)
            {
              var swap = panelist1;
              panelist1 = panelist2;
              panelist2 = swap;
            }
        }
    }
}
}


function mapPanelistsToSession(Sessions, rows, Panelists)
{
    var session = null;
    var sessionLink = null;
    for (rowcount = 1; rowcount < rows.length; rowcount++)
    {
        var link = rows[rowcount][attributesMap.get("Session Link")];
        if(sessionLink == null || sessionLink !== link)
        {
            sessionLink = link;
            session = new Session(rows[rowcount][attributesMap.get("Day")],
                                rows[rowcount][attributesMap.get("Start Time")],
                                rows[rowcount][attributesMap.get("End Time")],
                                rows[rowcount][attributesMap.get("Type")],   
                                rows[rowcount][attributesMap.get("Session")],
                                rows[rowcount][attributesMap.get("Session Title")],
                                rows[rowcount][attributesMap.get("Session Link")],
                                rows[rowcount][attributesMap.get("Venue")],
                                rows[rowcount][attributesMap.get("Panel Description")]
                                );  
            Sessions.push(session);
        }  
        let sessionPanelist = new Panelist(rows[rowcount][attributesMap.get("First Name")],
            rows[rowcount][attributesMap.get("Last Name")],
            rows[rowcount][attributesMap.get("Website Title")],
            rows[rowcount][attributesMap.get("Bio")],
            rows[rowcount][attributesMap.get("Title")],
            rows[rowcount][attributesMap.get("Institution")],
            rows[rowcount][attributesMap.get("Role")]);
        session.Panelists.push(sessionPanelist);
        Panelists.push(sessionPanelist);
    }
}

function deleteFolderFiles(directory){
    const files = fs.readdirSync(directory);
    for (const file of files)
    {
        fs.unlinkSync(path.join(directory, file));
    }
}

function createSessionfiles(Sessions)
{
    for(var sessioncount = 0; sessioncount< Sessions.length; sessioncount++)
    {
        var targetfiles_location = targetlocationFolder.concat("programs\\");
        var content = buildHtml(Sessions[sessioncount]);
        var filename = Sessions[sessioncount].link; 
        targetfiles_location = targetfiles_location.concat(filename);
        fs.writeFileSync(targetfiles_location + '.html', content);
    }
}

function createPanelistfiles(Sessions)
{
    for(var sessioncount = 0; sessioncount< Sessions.length; sessioncount++)
    {
        var session = Sessions[sessioncount];
        for(var panelistcount = 0; panelistcount < session.Panelists.length; panelistcount++)
        {
          var filename = session.Panelists[panelistcount].link;
          var content = buildPanelistContent(session.Panelists[panelistcount]);
          //console.log('Creating' + session.Panelists[panelistcount].name + 'file');
          var targetfiles_location = targetlocationFolder.concat("speakers\\");
          targetfiles_location = targetfiles_location.concat(filename);
          fs.writeFileSync(targetfiles_location + '.html', content);
        }
    }
}

function buildPanelistContent(Panelist)
{
    var header = buildPanelistHeader(Panelist);
    var body = (Panelist.bio!= null) ? buildPanelistBio(Panelist): "";
    var template = speaker_template.replace('{header}',header);
    template = template.replace('{body}', body);
    template = template.replace(/\{([title]+)\}/g,Panelist.name);
    return template;
}

function buildPanelistHeader(Panelist)
{
    var fullName = Panelist.name;
    var title = Panelist.title;
    var institution = Panelist.institution;
    var header = `<h2>${fullName}</h2>
                  <h4>${title}</h4>
                  <h4>${institution}</h4>`;
    return header;
}

function buildPanelistBio(Panelist)
{
    let body = '';
    let imageURL = imageFolderLocation + Panelist.link + '.png';
    let imageSrc = '';
 /**   fetch(imageURL, {mode: 'cors'}).then((response)=>{ 
        if(response.status == 200){
            imageSrc = imageURL;
            console.log('Success fetchting ');
        }
    }) */
    var image_template = `<div data-embed-button="media_browser" data-entity-embed-display="view_mode:media.embedded" data-entity-type="media" data-entity-uuid="7e65e94f-48b5-40ca-a0bc-2b805b4aa1f3" data-langcode="en" class="embedded-entity align-right">
        <div>
            <div class="field field--name-image field--type-image field--label-hidden field--item"> <img src="${imageSrc}" width="255" height="383" alt="havidan rodriguez photo" typeof="foaf:Image" class="img-responsive" style="border-radius: 4px; margin-top: 5px; margin-left: 20px"></div>
        </div>
        </div>`
    var paragraphs = Panelist.bio.split('\n');   
    for(var paracount = 0; paracount < paragraphs.length; paracount++)
    {
        if(paragraphs[paracount] != '\r')
        {
                body+= '<p>'+ paragraphs[paracount].replace('\r','') +'</p>'+ '\n';
        }
    }
    body = (imageSrc!= '')? image_template + body: body;
    let content = `<div class = 'speaker-content'>${body}</div>`;
    return content;
}

function buildHtml(session){
   var speakerroles = [];
   var speakertemplates = [];

   var header = buildHeader(session);
   //Finds distinct Panelist roles for session and stores it in speakerroles array
   speakerroles = findPanelistRoles(speakerroles, session);
   /**Creates profile template for each Panelist and stores their profiles in multidimensional array 
   as per their roles in speakerroles index*/ 
   for(var speakercount = 0; speakercount< session.Panelists.length; speakercount++)
    {
        var role = assignRolesforSession(session, session.Panelists[speakercount]);
        if(role!== "Back-up Armchair Discussion Leader" && role!== "Back-up Roundtable Leader" && role!== "Backup")
        {
            //Build Panelist Profile
            var speaker_template = buildPanelistProfile(session.Panelists[speakercount], true);
            //Stores Profiles by Role
            storeProfileTemplatesByRole(role, speakerroles, speaker_template, speakertemplates);
        }   
    }
    //Builds Session Content for a session
    var sessionContent = buildSessionContent(speakerroles, speakertemplates);
    //Combines header and content and generates Session Template
    var sessionTemplate = buildSessionTemplate(header, session, sessionContent);
    return sessionTemplate;
}

function buildHeader(session)
{
    let title = (session.link == "welcome-for-rise")? "Welcome for RISE 2019": session.title;
    let startTime = session.startTime;
    let endTime = session.endTime;
    let day = (18 + session.day) -1;
    let description = session.description;
    let venue = session.venue;
    
    var header = `<h2>${title}</h2>
                   <p>&nbsp;</p>
                   <h4>Time: ${startTime} - ${endTime}, November ${day}</h4>
                   <h4>Location: ${venue}</h4>
                   <p>${description}</p>`;
    return header;
}

function findPanelistRoles(speakerroles, session)
{
    for(var speakercount = 0; speakercount< session.Panelists.length; speakercount++)
    {   
        var speakerRole = assignRolesforSession(session, session.Panelists[speakercount]);   
        if(!speakerroles.includes(speakerRole) && speakerRole!== "Backup" && speakerRole!== "Back-up Armchair Discussion Leader" && speakerRole!== "Back-up Roundtable Leader")
        {
            speakerroles.push(speakerRole);
        }
    }
    if(session.link != "welcome-for-rise")
    {
        speakerroles.sort();
        if(speakerroles.includes("Moderator"))
        {
            let moderatorindex = speakerroles.indexOf("Moderator");
            speakerroles[moderatorindex] = speakerroles[0];
            speakerroles[0] = "Moderator";
        }

        return speakerroles;
    }
    else
    {
        return welcome_sessions_roles;
    }
    
}

function buildPanelistProfile(Panelist, isRelativeURl)
{
    var name = Panelist.name;
    var link = "https://rise2019.org/speakers/"+ Panelist.link + '.html';
    var imageSrc = 'https://rise2019.org/img/Profile.png';
    var imageURL = imageFolderLocation + Panelist.link + '.png';
    var designation = '';
    if(Panelist.title== "" && Panelist.institution == "")
    {
        designation = '';
    }
    else if(Panelist.title == "" || Panelist.institution == "")
    {
        designation = Panelist.title + Panelist.institution;
    }
    else
    {
        designation = Panelist.title + ", "+ Panelist.institution;
    }
    //Check for null condition
/**     fetch(imageURL, {mode: 'cors'}).then((response)=>{ 
        if(response.status == 200){
            imageSrc = imageURL;
            console.log('Success fetching image');
        }
    })*/

        var speaker_template = `<div class = "col-lg-4 col-md-4 col-sm-6">
                    <a class = "speakers-link" href = "${link}">
                    <p class = "speakers-info">    
                    <img  class = "speakers-img" src= "${imageSrc}" />
                    <br>
                    <span class = "title">
                    <strong>${name}</strong>
                    <br>
                    ${designation}
                    </span>
                    </p>
                    </a>
                    </div>`;
    return speaker_template;
}

function storeProfileTemplatesByRole(role, speakerroles, speaker_template, speakertemplates)
{
    if(speakertemplates[speakerroles.indexOf(role)] === undefined)
            {
                speakertemplates[speakerroles.indexOf(role)] = new Array();
            }  
    speakertemplates[speakerroles.indexOf(role)].push(speaker_template);  
}

function assignRolesforSession(session, Panelist)
{
    var speakerRole = Panelist.role; 
    if(session.link == "welcome-for-rise")
        { 
           switch(Panelist.name)
           {
               case "Kristina M. Johnson":
                   speakerRole = "Welcome from the Honorary Chairs (SUNY)";
                   break;
               
               case "Michelle Wyman":
                   speakerRole = "Welcome from NCSE";
                   break;
                
               case "Havidán Rodríguez":
                    speakerRole = "Welcome from the University at Albany";
                    break;
              
               default:
                   speakerRole = "Welcome from Program Chairs";
           }
        }
    return speakerRole;
}

function buildSessionContent(speakerroles, speakertemplates)
{
    var content = '';
    for(var speakerRoleCount = 0; speakerRoleCount < speakerroles.length; speakerRoleCount++)
    {
        var role = speakerroles[speakerRoleCount];
        var role_template = `<div class = "speakers">
        <h3>${role}</h3>
        <p>&nbsp;</p>`;
        for(var speakerCount = 0; speakerCount < speakertemplates[speakerRoleCount].length; speakerCount++)
        {
            role_template = role_template + speakertemplates[speakerRoleCount][speakerCount] + '\n';
        }
        role_template = role_template + '</div>\n';
        content = content + role_template;
    }
    return content;
}

function buildSessionTemplate(header, session, sessionContent)
{
    sessionContent = header + sessionContent;
    var session_template = template.replace('{content}', sessionContent);
    session.title = (session.link == "welcome-for-rise")? "Welcome for RISE 2019": session.title;
    session_template = session_template.replace(/\{([title]+)\}/g,session.title);
    return session_template;
}

function createSpeakersPage(Panelists){
    Panelists.sort((a,b) => (a.link > b.link) ? 1:-1);
    let panelLink = null;
    let content = '';
    for(let panelistCount = 0; panelistCount < Panelists.length; panelistCount++)
    {
        let link = Panelists[panelistCount].link;
        if(panelLink == null || panelLink !== link)
        {
            panelLink = link;
            content = content + buildPanelistProfile(Panelists[panelistCount], false);
        }

    }
    content = rise_speaker_template.replace('{content}', content);
    fs.writeFileSync(targetlocationFolder.concat("participants.html"), content);
}

function createAgendaPages(Sessions)
{
    for(let day = 1; day <= 3; day ++)
    {
        let agenda_template = fs.readFileSync('C:\\Automation Scripts\\agenda-day'+ day+'-template.html').toString();
        let current_day_sessions = Sessions.filter(session => {return session.day === day;
        });
        session_types.forEach(sessionType => {
            current_type_sessions = current_day_sessions.filter(current_day_session => {return current_day_session.sessionType == sessionType;
            });
            
        if(current_type_sessions!= undefined)
        {
            if(sessionType == "Panel Discussion")
            {  
                pre_lunch_sessions = current_type_sessions.filter(current_type_session =>{
                    return current_type_session.startTime.includes("AM");
                });
                let content = buildAgendaContent(pre_lunch_sessions);
                agenda_template = agenda_template.replace('{Pre-Lunch Panel Discussion}', content);
                post_lunch_sessions = current_type_sessions.filter(current_type_session =>{
                    return current_type_session.startTime.includes("PM");
                });
                content = buildAgendaContent(post_lunch_sessions);
                agenda_template = agenda_template.replace('{Post-Lunch Panel Discussion}', content);
                
            }
            else
            { 
                let content = buildAgendaContent(current_type_sessions);
                agenda_template = agenda_template.replace('{' + sessionType +'}', content);
            }
        }
        });
        fs.writeFileSync(targetlocationFolder.concat('agenda-day')+ day + '.html', agenda_template);
    }
}

function buildAgendaContent(CurrentSessions)
{
    let content = '';
    let sessionLink = null;
    for(let current_day_session_count = 0; current_day_session_count < CurrentSessions.length; current_day_session_count++)
    {
        let link = CurrentSessions[current_day_session_count].link;
        if(sessionLink == null || sessionLink !== link)
        {
            sessionLink = link;
        let moderatorElem = '';
        let panelistElem = '';
        let sessionTitle1 =  CurrentSessions[current_day_session_count].sessionTitle1;
        let sessionTitle2 = CurrentSessions[current_day_session_count].sessionTitle2;
        for(let panelistCount = 0; panelistCount < CurrentSessions[current_day_session_count].Panelists.length; panelistCount++)
        {
            let panelist = (sessionLink == 'welcome-for-rise')?CurrentSessions[current_day_session_count].Panelists[welcome_panelist_order[panelistCount]]: CurrentSessions[current_day_session_count].Panelists[panelistCount];
            let name = panelist.name;
            let title = panelist.title;
            let institution = panelist.institution;
            let titleInstitution =  title + ', '+ institution;
            titleInstitution = (title == '' || institution == '')? titleInstitution.replace(', ', '') : titleInstitution;
            titleInstitution = (title == '' && institution == '')? '' : ', '+ titleInstitution;
            let panelistLink = "https://rise2019.org/speakers/" + panelist.link + ".html";
            if(panelist.role == 'Moderator')
            {
                moderatorElem = `<span class="moderator-text"><strong><span class="underline">Moderator</span>: <a href = "${panelistLink}" target = "_blank">${name}</a></strong>${titleInstitution}</span>`;
            }
            else
            {
                panelist_element = `<li><a href = "${panelistLink}" target = "_blank"><span class="strong">${name}</span></a><span>${titleInstitution}</span></li>`;
                panelistElem = panelistElem.concat(panelist_element);
            }
        }
        let Venue = CurrentSessions[current_day_session_count].venue;
        let programLink = "https://rise2019.org/programs/"+ CurrentSessions[current_day_session_count].link + ".html";
        let session_element = `<div style="margin-bottom: 10px;" class="session-container">
                <a href = "${programLink}" target = "_blank">
                <span style="color: rgb(87, 53, 126);"><strong>${sessionTitle1}</strong></span></a>
                <span class="italic">${sessionTitle2}</span>
                <br>
                <span><strong>Location:</strong> ${Venue}</span>
                <div class="speaker-container">
                ${moderatorElem}
                <ul class="panelist">
                ${panelistElem}
                </ul>
                </div>
                </div>`;
        content = content.concat(session_element);
        }
    }
        return content;        
}



