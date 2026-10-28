(()=>{
  'use strict';
  if(document.body?.dataset.page!=='feedback'||window.__feedbackInlineFixes)return;
  window.__feedbackInlineFixes=true;

  const form=document.getElementById('feedback-form');
  if(!form)return;
  const field=name=>form.elements.namedItem(name);
  const controls=name=>[...form.querySelectorAll(`[name="${name}"]`)];

  const clearError=name=>{
    controls(name).forEach(el=>{
      el.removeAttribute('aria-invalid');
      const described=el.getAttribute('aria-describedby');
      if(described===`feedback-error-${name}`)el.removeAttribute('aria-describedby');
    });
    form.querySelectorAll(`.feedback-inline-error[data-for="${name}"]`).forEach(el=>el.remove());
  };

  const clearAllErrors=()=>{
    form.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.feedback-inline-error').forEach(el=>el.remove());
  };

  const showError=(name,message)=>{
    clearError(name);
    const els=controls(name);
    els.forEach(el=>{
      el.setAttribute('aria-invalid','true');
      el.setAttribute('aria-describedby',`feedback-error-${name}`);
    });
    const error=document.createElement('small');
    error.id=`feedback-error-${name}`;
    error.className='feedback-inline-error';
    error.dataset.for=name;
    error.setAttribute('role','alert');
    error.textContent=message;

    if(name==='target'){
      const host=form.querySelector('.feedback-step[data-step="0"] fieldset');
      host?.append(error);
    }else if(name==='rating'){
      const caption=document.getElementById('rating-caption');
      (caption?.parentElement||form.querySelector('.rating-field'))?.append(error);
    }else{
      const control=els[0];
      if(control)control.insertAdjacentElement('afterend',error);
    }
  };

  const showFormError=message=>{
    clearError('submit');
    const host=form.querySelector('.hold-wrap')||form.querySelector('.feedback-step:not([hidden]) .flow-actions')||form;
    const error=document.createElement('small');
    error.id='feedback-error-submit';
    error.className='feedback-inline-error feedback-submit-error';
    error.dataset.for='submit';
    error.setAttribute('role','alert');
    error.textContent=message;
    host.append(error);
  };

  const visibleStep=()=>[...form.querySelectorAll('.feedback-step')].findIndex(step=>!step.hidden);

  const validateStep=step=>{
    if(step===0){
      clearError('target');
      if(!field('target')?.value){
        showError('target','Choose Franklin helper or the GTA V iOS launcher.');
        return false;
      }
    }
    if(step===1){
      for(const name of ['rating','title','message','steps'])clearError(name);
      if(!field('rating')?.value){
        showError('rating','Please select a star rating.');
        return false;
      }
      const checks=[
        ['title',5,'Add a short summary with at least 5 characters.'],
        ['message',15,'Tell us a little more, using at least 15 characters.']
      ];
      if(field('kind')?.value==='issue')checks.push(['steps',10,'Add the steps that caused the issue, using at least 10 characters.']);
      for(const [name,min,message] of checks){
        const control=field(name);
        if(!control||String(control.value||'').trim().length<min){
          showError(name,message);
          control?.focus({preventScroll:false});
          return false;
        }
      }
    }
    return true;
  };

  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    const next=event.target.closest('.feedback-next');
    if(!next||next.id==='new-report'||!form.contains(next))return;
    const step=visibleStep();
    if(validateStep(step))return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  form.addEventListener('input',event=>{
    const name=event.target instanceof Element?event.target.getAttribute('name'):'';
    if(name)clearError(name);
    clearError('submit');
  },true);
  form.addEventListener('change',event=>{
    const name=event.target instanceof Element?event.target.getAttribute('name'):'';
    if(name)clearError(name);
    clearError('submit');
  },true);

  document.addEventListener('click',event=>{
    if(event.target instanceof Element&&event.target.closest('#new-report'))clearAllErrors();
  },true);

  // The legacy script still uses the toast for network failures and copy feedback.
  // Convert actual failures into an inline footer and suppress the floating toast.
  const toast=document.getElementById('feedback-toast');
  if(toast){
    const absorbToast=()=>{
      if(toast.hidden)return;
      const message=toast.textContent.trim();
      toast.hidden=true;
      if(!message||/reference copied/i.test(message))return;
      if(/your reference:/i.test(message))return;
      showFormError(message);
    };
    new MutationObserver(absorbToast).observe(toast,{attributes:true,childList:true,characterData:true,subtree:true});
    absorbToast();
  }

  // feedback.js historically moves the real launcher into an old page slot.
  // Keep Franklin as one global floating helper instead.
  const normalizeHelper=()=>{
    const launchers=[...document.querySelectorAll('.ask-franklin-launcher')];
    if(launchers.length){
      launchers.slice(1).forEach(el=>el.remove());
      if(launchers[0].parentElement?.id==='feedback-helper-slot')document.body.append(launchers[0]);
      document.querySelectorAll('.lazy-franklin').forEach(el=>{el.hidden=true;});
    }
    document.querySelectorAll('.franklin-nudge').forEach(el=>el.remove());
  };
  const helperObserver=new MutationObserver(normalizeHelper);
  helperObserver.observe(document.body,{childList:true,subtree:true});
  normalizeHelper();
})();
