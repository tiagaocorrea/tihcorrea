class Form {

  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.form_url =this.form.dataset.ajaxurl;
    this.formResultText = this.form.querySelector('.Form__output p');
    this.submit = this.form.querySelector('[type=submit]');

    this.form.addEventListener('submit', (e) => this.onSubmit(e))
  }


  onSubmit(e) {
    e.preventDefault();
    document.body.style.cursor =  'wait';
    this.submit.disabled = true;
    /* Remove previous errors */
    this.formResultText.innerHTML = '';
    this.formResultText.classList.remove('is--error');

    const errors = this.form.querySelectorAll('span.error');
    errors.forEach((err) => {
      err.parentNode.classList.remove('is-error')
      err.remove();
    })

    /* Add values to formData */
    const formData = new FormData();
    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.disabled = true;
      formData.append(field.name, field.value);
    })

    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.form_url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        document.body.style.cursor =  'default';
        this.submit.disabled = false;
        fields.forEach(field => {
          field.disabled = false;
        })
        switch (xhr.status) {
          case 200:
            this.onSuccess(xhr.responseText)
            break;
          case 422:
            this.onInvalid(xhr.responseText);
            break;
          default:
            this.onServerError();
        }
      }
    }
    xhr.send(formData);
  }

  onSuccess(text) {
    this.formResultText.innerHTML = text;
    this.form.reset()
  }

  onInvalid(text) {
    const json = JSON.parse(text);
    for ( let fieldName of Object.keys(json)){
      const field = this.form.querySelector(`[name=${fieldName}]`)
      if (field){
        const err = document.createElement('span');
        err.innerHTML = json[fieldName].join('. ');
        err.classList.add('error');
        field.parentNode.appendChild(err);
        field.parentNode.classList.add('is-error');
      }
    }
  }

  onServerError() {
    this.formResultText.innerHTML = 'Une erreur est survenue. Merci de réessayer ulterieurement';
    this.formResultText.classList.add('is--error')
  }
}
