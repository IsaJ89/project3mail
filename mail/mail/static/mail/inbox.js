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
  const submitButton = document.querySelector('#submit');
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
      const divView = document.createElement('div');
      const divArchive = document.createElement('div');
      

      
      divSender.innerHTML = obj['sender'];
      divSubject.innerHTML = obj['subject'];
      divTime.innerHTML = obj['timestamp'];

      emailDiv.classList.add('row');
      
      
      divSender.classList.add('col-2'); 
      divSubject.classList.add('col-5'); 
      divTime.classList.add('col-3');
      divArchive.classList.add('col-1');
      divView.classList.add('col-1');
      
      
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
      view.value = obj['id'];
      view.innerHTML = 'View';

      divView.append(view);

      const archiveButton = document.createElement('button');
      archiveButton.type= 'button';
      archiveButton.classList.add('btn', 'btn-outline-dark');
      archiveButton.value = obj['id'];
      archiveButton.setAttribute('data-archive','archive');

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

      divArchive.append(archiveButton);
      


      emailDiv.append(divSender,divSubject,divTime,divArchive,divView);
      document.querySelector('#emails-view').append(emailDiv);
    });

   // Query and add event listener to the view buttons
   document.querySelectorAll('.btn-outline-dark').forEach( button => {
    button.onclick = function () {
      show_email(button.value);
    }
   })

   // Query and add event listener to the archive button
    document.querySelectorAll('[data-archive]').forEach( button => {
      button.onclick = function () {
        archive_email(button.value, button.innerHTML);
      }
    })

  });
}

function show_email(id) {
  
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

  
  // query the reply button and add an event listener to it
  const replyButton = document.querySelector('#reply-button');
  replyButton.onclick = function() {
    reply_to_email(id);
  }

}

function archive_email(id, innerHTML_value) {
  console.log(id);
  console.log(innerHTML_value);
  if(innerHTML_value == 'Archive') {
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
  else if(innerHTML_value == 'Unarchive') {
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

function reply_to_email(id) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fetch email contents
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Pre-fill composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = (`Re: ${email.subject}`);
    document.querySelector('#compose-body').innerHTML = (`On ${email.timestamp}, ${email.sender} wrote: "${email.body}"`);
  });

  // Fetch submit button
  const submitButton = document.querySelector('#submit')
  submitButton.onclick = function(event) {

    // Prevent default form submission
    event.preventDefault();

    // Extract email contents
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

