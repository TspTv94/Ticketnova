let allEvents=[],currentEvent=null,quantities={};
let myTickets=JSON.parse(localStorage.getItem('tn_tickets')||'[]');

window.addEventListener('load',async()=>{
  setTimeout(()=>{document.getElementById('loader').classList.add('hidden');initScrollAnimations();animateCounters();},1400);
  allEvents=await ApiService.getEvents('all');
  renderEvents(allEvents);renderMyTickets();
});

function renderEvents(events){
  const grid=document.getElementById('events-grid');
  grid.innerHTML='';
  if(!events.length){grid.innerHTML='<div class="loading-events">No events found.</div>';return;}
  events.forEach((ev,i)=>{
    const soldOut=ev.seatsLeft===0;
    const minPrice=Math.min(...ev.tickets.map(t=>t.price));
    const isFeatured=i===0&&ev.featured;
    const card=document.createElement('div');
    card.className=`event-card reveal${isFeatured?' featured':''}`;
    card.innerHTML=`
      <div class="card-img">
        <div class="card-img-emoji" style="background:${ev.gradient};">${ev.emoji}</div>
        <div class="card-img-overlay"></div>
        <div class="card-badge badge-${ev.category}">${ev.category.charAt(0).toUpperCase()+ev.category.slice(1)}</div>
        ${soldOut?'<div class="card-badge badge-soldout" style="top:auto;bottom:16px;">SOLD OUT</div>':''}
        <div class="card-price">from ₹${minPrice.toLocaleString('en-IN')}</div>
      </div>
      <div class="card-body">
        <div class="card-date">${ev.date} · ${ev.time}</div>
        <div class="card-title">${ev.title}</div>
        <div class="card-venue"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${ev.venue}</div>
        <div class="card-footer">
          <div class="seats-left">${soldOut?'<span style="color:var(--accent);">Fully Booked</span>':`<strong>${ev.seatsLeft}</strong> seats left`}</div>
          <button class="book-btn" onclick="openModal(${ev.id})" ${soldOut?'disabled':''}>
            ${soldOut?'Sold Out':'Book Now →'}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
    setTimeout(()=>card.classList.add('visible'),80+i*80);
  });
}

function filterEvents(cat,btn){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderEvents(cat==='all'?allEvents:allEvents.filter(e=>e.category===cat));
}
function filterAll(){document.querySelector('.tab').click();}

function openModal(id){
  currentEvent=allEvents.find(e=>e.id===id);
  if(!currentEvent)return;
  quantities={};
  currentEvent.tickets.forEach((_,i)=>quantities[i]=0);
  document.getElementById('modal-title').textContent=currentEvent.title;
  document.getElementById('modal-badge').textContent=currentEvent.category.charAt(0).toUpperCase()+currentEvent.category.slice(1);
  document.getElementById('modal-badge').className=`card-badge badge-${currentEvent.category}`;
  document.getElementById('modal-date').textContent=currentEvent.date;
  document.getElementById('modal-venue').textContent=currentEvent.venue;
  document.getElementById('modal-time').textContent=currentEvent.time;
  const imgBg=document.getElementById('modal-img-bg');
  imgBg.style.background=currentEvent.gradient;imgBg.textContent=currentEvent.emoji;
  renderTicketTypes();updateSummary();clearForm();
  document.getElementById('booking-view').style.display='block';
  document.getElementById('success-view').classList.remove('show');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');document.body.style.overflow='';}
function closeModalOutside(e){if(e.target===document.getElementById('modal-overlay'))closeModal();}

function renderTicketTypes(){
  const c=document.getElementById('ticket-types-container');c.innerHTML='';
  currentEvent.tickets.forEach((t,i)=>{
    c.innerHTML+=`<div class="ticket-type"><div class="ticket-info"><h4>${t.type}</h4><p>${t.desc}</p></div><div class="ticket-price">₹${t.price.toLocaleString('en-IN')}</div><div class="qty-control"><button class="qty-btn" onclick="changeQty(${i},-1)">−</button><span class="qty-num" id="qty-${i}">0</span><button class="qty-btn" onclick="changeQty(${i},1)">+</button></div></div>`;
  });
}
function changeQty(i,d){quantities[i]=Math.max(0,Math.min(10,(quantities[i]||0)+d));document.getElementById(`qty-${i}`).textContent=quantities[i];updateSummary();}
function updateSummary(){
  let sub=0;currentEvent.tickets.forEach((t,i)=>sub+=t.price*(quantities[i]||0));
  const fee=Math.round(sub*0.03),total=sub+fee;
  document.getElementById('subtotal').textContent=`₹${sub.toLocaleString('en-IN')}`;
  document.getElementById('booking-fee').textContent=`₹${fee.toLocaleString('en-IN')}`;
  document.getElementById('total-price').textContent=`₹${total.toLocaleString('en-IN')}`;
  document.getElementById('btn-amount').textContent=total>0?`— ₹${total.toLocaleString('en-IN')}`:'';
  document.getElementById('checkout-btn').disabled=total===0;
}

async function processBooking(){
  const fname=document.getElementById('fname').value.trim(),lname=document.getElementById('lname').value.trim();
  const email=document.getElementById('email').value.trim(),phone=document.getElementById('phone').value.trim();
  const card=document.getElementById('card').value.replace(/\s/g,''),expiry=document.getElementById('expiry').value.trim(),cvv=document.getElementById('cvv').value.trim();
  if(!fname||!lname||!email||!phone){showToast('⚠️','Missing Details','Please fill in all required fields.');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showToast('⚠️','Invalid Email','Enter a valid email.');return;}
  if(card.length<16){showToast('⚠️','Invalid Card','Enter a valid 16-digit card number.');return;}
  if(expiry.length<5){showToast('⚠️','Invalid Expiry','Enter MM/YY.');return;}
  if(cvv.length<3){showToast('⚠️','Invalid CVV','Enter a 3-digit CVV.');return;}
  const selectedTickets=currentEvent.tickets.map((t,i)=>quantities[i]>0?{type:t.type,qty:quantities[i]}:null).filter(Boolean);
  if(!selectedTickets.length){showToast('⚠️','No Tickets','Select at least one ticket.');return;}
  const btn=document.getElementById('checkout-btn');btn.textContent='Processing…';btn.disabled=true;
  const result=await ApiService.createBooking({eventId:currentEvent.id,customer:{firstName:fname,lastName:lname,email,phone},tickets:selectedTickets});
  if(result.success){
    let sub=0;currentEvent.tickets.forEach((t,i)=>sub+=t.price*(quantities[i]||0));
    const fee=Math.round(sub*0.03);
    const booking={id:result.data.id,eventId:currentEvent.id,eventTitle:currentEvent.title,eventDate:currentEvent.date,eventTime:currentEvent.time,venue:currentEvent.venue,gradient:currentEvent.gradient,emoji:currentEvent.emoji,category:currentEvent.category,customer:{firstName:fname,lastName:lname,email,phone},tickets:currentEvent.tickets.map((t,i)=>quantities[i]>0?{type:t.type,qty:quantities[i],price:t.price}:null).filter(Boolean),subtotal:sub,bookingFee:fee,total:sub+fee,status:'confirmed',bookedAt:new Date().toISOString()};
    myTickets.push(booking);localStorage.setItem('tn_tickets',JSON.stringify(myTickets));renderMyTickets();
    document.getElementById('ticket-id-display').textContent=booking.id;
    document.getElementById('booking-view').style.display='none';
    document.getElementById('success-view').classList.add('show');
    showToast('🎟️','Booking Confirmed!',`Ticket ID: ${booking.id}`);
  }else{showToast('❌','Booking Failed','Please try again.');}
  btn.textContent='Confirm & Pay';btn.disabled=false;
}

function renderMyTickets(){
  const list=document.getElementById('tickets-list');
  if(!myTickets.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">🎟️</div><p>No tickets yet.<br>Browse events and book your first experience!</p></div>';return;}
  list.innerHTML=myTickets.slice().reverse().map(t=>`
    <div class="my-ticket">
      <div class="ticket-stripe"></div>
      <div class="ticket-emoji" style="background:${t.gradient};">${t.emoji}</div>
      <div class="ticket-details">
        <div class="ticket-name">${t.eventTitle}</div>
        <div class="ticket-sub">${t.eventDate} · ${t.eventTime} · ${t.venue}</div>
        <div class="ticket-meta">${t.tickets.map(tk=>`${tk.qty}× ${tk.type}`).join(' | ')} &nbsp;·&nbsp; <span style="color:var(--gold);font-family:'Space Mono',monospace;">₹${t.total.toLocaleString('en-IN')}</span></div>
        <div class="ticket-id-tag">${t.id}</div>
      </div>
      <div class="ticket-qr"><svg viewBox="0 0 64 64" width="50" height="50">${genQR()}</svg></div>
      <div class="ticket-status status-confirmed">✓ Confirmed</div>
    </div>`).join('');
}

function showSection(sec){
  const ev=document.getElementById('events'),tk=document.getElementById('my-tickets'),sb=document.querySelector('.stats-bar'),hr=document.getElementById('home');
  if(sec==='events'){ev.style.display='block';sb.style.display='flex';hr.style.display='flex';tk.classList.remove('visible');ev.scrollIntoView({behavior:'smooth'});}
  else{ev.style.display='none';sb.style.display='none';hr.style.display='none';tk.classList.add('visible');renderMyTickets();window.scrollTo({top:0,behavior:'smooth'});}
}
function animateCounters(){document.querySelectorAll('[data-count]').forEach(el=>{const t=parseInt(el.dataset.count);let c=0;const s=t/60;const timer=setInterval(()=>{c=Math.min(c+s,t);if(t>=1000000)el.textContent=(c/1000000).toFixed(1)+'M+';else if(t>=1000)el.textContent=Math.floor(c/1000)+'K+';else el.textContent=Math.floor(c)+(t===99?'%':'+');if(c>=t)clearInterval(timer);},25);});}
function initScrollAnimations(){const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible');});},{threshold:0.1});document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));}
function showToast(icon,title,msg){const t=document.getElementById('toast');document.getElementById('toast-icon').textContent=icon;document.getElementById('toast-title').textContent=title;document.getElementById('toast-msg').textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),4000);}
function formatCard(el){let v=el.value.replace(/\D/g,'').substring(0,16);el.value=v.replace(/(.{4})/g,'$1 ').trim();}
function formatExpiry(el){let v=el.value.replace(/\D/g,'').substring(0,4);if(v.length>=2)v=v.substring(0,2)+'/'+v.substring(2);el.value=v;}
function clearForm(){['fname','lname','email','phone','city','card','expiry','cvv'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});}
function genQR(){let r='';for(let i=0;i<7;i++)for(let j=0;j<7;j++)if(Math.random()>0.45)r+=`<rect x="${j*9+1}" y="${i*9+1}" width="8" height="8" fill="var(--text)" rx="1"/>`;return r;}
EOF