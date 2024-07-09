document.addEventListener('DOMContentLoaded', function() {
  

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Fetch submit button
  const submitButton = document.querySelector('.btn.btn-primary');
  submitButton.onclick = function(event) {
    
    // prevent default form submission
    event.preventDefault();
    
    // extract email contents
    const emailRecipients = document.querySelector('#compose-recipients').value;
    const emailSubject = document.querySelector('#compose-subject').value;
    const emailBody = document.querySelector('#compose-body').value;
    

    // send POST request
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: emailRecipients,
        subject: emailSubject,
        body: emailBody
      })
    })
    .then(response => {
      // Log the status code
      console.log(response.status)
      return response.json()})

    .then(result => {
      // Log message
      console.log(`Message: ${result.message}`)

      // Load sent mailbox
      load_mailbox('sent')
    })
  }
}

function load_mailbox(mailbox) {
  console.log(`The mailbox loaded is ${mailbox}`);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetch all mails in the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
    result.forEach( obj => {
      const emailDiv = document.createElement('div');
      const divSender = document.createElement('div');
      const divSubject = document.createElement('div');
      const divTime = document.createElement('div');
      const viewButton = document.createElement('div');

      
      divSender.innerHTML = obj['sender'];
      divSubject.innerHTML = obj['subject'];
      divTime.innerHTML = obj['timestamp'];

      emailDiv.classList.add('row');
      
      
      divSender.classList.add('col-2'); 
      divSubject.classList.add('col-6'); 
      divTime.classList.add('col-3');
      viewButton.classList.add('col-1')
      
      divSender.style.fontWeight = "bold"

      if(obj['read'] == false) {
        emailDiv.style.background = "#F2F2F2";
      }
      else{
        emailDiv.style.background = "#FFFFFF"; 
      }
      
      const view = document.createElement('button');
      view.type = 'button';
      view.classList.add('btn','btn-outline-dark');
      view.id = obj['id'];
      view.innerHTML = 'View';

      viewButton.append(view);

      emailDiv.append(divSender,divSubject,divTime,viewButton);
      document.querySelector('#emails-view').append(emailDiv);
    });
   // Query and add event listener to the view buttons
   document.querySelectorAll('.btn-outline-dark').forEach( button => {
    button.onclick = function () {
      show_email(button.id, mailbox);
    }
   })
  });
}

function show_email(id, mailbox){
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block'

  // Mark the email as read
  fetch(`emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  
  
  // Fetch the contents of the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    //Print email
    console.log(email);
    document.querySelector('#sender').innerHTML = (`<b>From:</b> ${email.sender}`);
    document.querySelector('#recipients').innerHTML = (`<b>To:</b> ${email.recipients}`);
    document.querySelector('#subject').innerHTML = (`<b>Subject:</b> ${email.subject}`);
    document.querySelector('#timestamp').innerHTML = (`<b>Time:</b> ${email.timestamp}`);
    document.querySelector('#body').innerHTML = email.body;
  });


  // get the archive/unarchive button
  const archiveButton = document.querySelector('#archive-button');

  

  if(mailbox == 'inbox'){
    console.log(`Mailbox is: ${mailbox}`);
    archiveButton.innerHTML = 'Archive';
    archiveButton.style.display = 'block';
  }
  else if(mailbox == 'archive') {
    console.log(`Mailbox is: ${mailbox}`);
    archiveButton.innerHTML = 'Unarchive';
    archiveButton.style.display = 'block';
  }
  else{
    archiveButton.style.display = 'none';
  }


  archiveButton.onclick = function() {
    
    if(archiveButton.innerHTML == 'Archive') {
      fetch(`emails/${id}`,{
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      .then( () => {
        load_mailbox('inbox')
      })
    }
    else if(archiveButton.innerHTML == 'Unarchive') {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      .then( () => {
        load_mailbox('inbox')
      })
    }
  };
}


