import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  isSent = false;

  onSubmit(form: NgForm) {
    const email = form.value.email;

    // Check if any required field is missing (excluding file upload)
    if (!form.value.name || !form.value.email || !form.value.subject || !form.value.details) {
      alert('Please fill out all required fields.');
      return;
    }

    // Email validation: check for '@' symbol
    if (!email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    // If all checks pass, mark as sent
    this.isSent = true;
    console.log('Form submitted successfully:', form.value);

    // Optionally, you can reset the form here if needed
    // form.reset();
  }
}