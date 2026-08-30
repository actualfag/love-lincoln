const days = [
  { day:'FRI', date:'01.15', image:'/images/coliseum-party.jpg', events:[['6 PM','Birthday Banquet','The Coliseum'],['8:30 PM','Karaoke','Lookout Lounge'],['12 AM','Wiiinter Pool Party','Iiindoor Spa']] },
  { day:'SAT', date:'01.16', image:'/images/performer.jpg', events:[['ALL DAY','Bed, bath & beyond','Free time'],['8:30 PM','Let’s Make a Baby','Lookout Lounge'],['11 PM','Company of Angels: Revival','Rave Room']] },
  { day:'SUN', date:'01.17', image:'/images/pool-party.jpg', events:[['12 PM','Spice Brunch','Spooner’s Theater'],['6 PM','Family Dinner','Lookout Lounge'],['9 PM','Closing Party','TBD']] },
  { day:'MON', date:'01.18', image:'/images/breakfast-room.jpg', events:[['MORNING','Kiss, cry, check out','Cove Haven']] },
];

const rooms = [
  { name:'Cove Harbour', tag:'THE CLASSIC', image:'/images/breakfast-room.jpg', text:'Heart-shaped whirlpool, king bed and a log-burning fireplace.' },
  { name:'Juliette', tag:'THE SPLIT-LEVEL', image:'/images/round-bed-room.jpg', text:'Retro romance and all the essential mood lighting.' },
  { name:'Garden of Eden Apple', tag:'THE TEMPTATION', image:'/images/tub-and-pool.jpg', text:'Your own tiny indoor pool. An absolutely reasonable choice.' },
  { name:'Champagne Tower', tag:'THE ICON', image:'/images/champagne-suite.jpg', text:'Four stories, seven-foot whirlpool and no restraint whatsoever.' },
];

export default function Home() {
  return <main>
    <nav className="bottom-nav" aria-label="Main navigation">
      <a href="#weekend"><span>01</span>Weekend</a><a href="#schedule"><span>02</span>Schedule</a><a href="#rooms"><span>03</span>Rooms</a><a className="nav-rsvp" href="#rsvp">RSVP</a>
    </nav>

    <header className="hero" id="weekend">
      <img className="hero-photo" src="/images/venue-arches.jpg" alt="The glamorous red interior of Cove Haven" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="kicker">MLK WEEKEND · COVE HAVEN · POCONOS</p>
        <div className="logo-card"><img src="/images/lincoln-is-for-lovers-logo.png" alt="Lincoln is for Lovers" /></div>
        <p className="birthday">50TH BIRTHDAY TWEAKEND</p>
        <p className="dates">JANUARY 15–18<br/>2027</p>
        <a className="primary" href="#rsvp">RSVP NOW <b>♥</b></a>
      </div>
      <p className="scroll-cue">A LONG WEEKEND OF BAD IDEAS ↓</p>
    </header>

    <section className="intro pad">
      <p className="section-no">00 / THE INVITATION</p>
      <h1>Four days.<br/>Fifty years.<br/><i>One very deep tub.</i></h1>
      <p className="big-copy">Come celebrate Lincoln with retro romance, queer spectacle, karaoke, pools, friendship and extremely specific carpeting.</p>
      <div className="split-note"><strong>BRING YOUR BOO—<br/>OR FIND ONE THERE.</strong><p>Cove Haven invented the heart-shaped tub. We intend to honor its legacy.</p></div>
    </section>

    <figure className="full-photo"><img src="/images/indoor-pool.jpg" alt="Cove Haven indoor pool and spa"/><figcaption>THE IIINDOOR SPA · OPEN VERY LATE</figcaption></figure>

    <section className="schedule pad" id="schedule">
      <p className="section-no">01 / RUN OF SHOW</p><h2>Lose track<br/>of time.</h2>
      <p className="schedule-note">“???” means Lincoln has released us from the tyranny of clocks.</p>
      <div className="days">
        {days.map(d=><article className="day" key={d.day}>
          <div className="day-image"><img src={d.image} alt=""/><span>{d.day}<b>{d.date}</b></span></div>
          <div className="events">{d.events.map(e=><div className="event" key={e[1]}><time>{e[0]}</time><div><strong>{e[1]}</strong><small>{e[2]}</small></div></div>)}</div>
        </article>)}
      </div>
      <aside className="cute-note"><b>KEEP IT CUTE.</b> Friday and Saturday share space with other resort guests. Sunday is just family.</aside>
    </section>

    <section className="rooms" id="rooms">
      <div className="pad room-head"><p className="section-no">02 / LOVE NESTS</p><h2>Pick your<br/><i>pleasure.</i></h2><p>Swipe through the four featured room types. Book directly with Cove Haven using our group code.</p></div>
      <div className="room-scroll">{rooms.map(r=><article className="room" key={r.name}><img src={r.image} alt={`${r.name} room at Cove Haven`}/><div className="room-copy"><span>{r.tag}</span><h3>{r.name}</h3><p>{r.text}</p><a href="https://www.covepoconoresorts.com/cove-haven-resort/rooms">SEE THE ROOM ↗</a></div></article>)}</div>
      <p className="swipe">SWIPE FOR MORE ROOMS →</p>
    </section>

    <section className="photo-break"><img src="/images/lookout-bar.jpg" alt="The Lookout Lounge bar at Cove Haven"/><div><span>MEET ME AT</span><strong>THE LOOKOUT</strong><p>Karaoke, drag, drinks, family dinner and whatever happens next.</p></div></section>

    <section className="rsvp pad" id="rsvp">
      <p className="section-no">03 / DO IT NOW</p><h2>RSVP first.<br/><i>Book next.</i></h2><p>Set your status, add your guest, then reserve directly with Cove Haven. Lincoln marks you BOOKED once your room is confirmed.</p>
      <form><label>YOUR NAME<input placeholder="First name + last initial"/></label><label>EMAIL<input type="email" placeholder="Private—never displayed"/></label><label>YOUR STATUS<select defaultValue=""><option value="" disabled>Choose one</option><option>Definite</option><option>Likely</option><option>Unlikely</option><option>Not Interested</option></select></label><label>ADD A GUEST<input placeholder="First name + last initial"/></label><label>OPTIONAL PUBLIC CONTACT<input placeholder="Instagram or Signal"/></label><button type="button">SUBMIT RSVP ♥</button></form>
    </section>

    <section className="rules pad"><p className="section-no">04 / HOUSE RULES</p><h2>Hot,<br/>not messy.</h2><details open><summary>WHAT’S THE VIBE?</summary><p>Glamorous retro-romance with club innuendo. Camp, comfort, snowstorm—possibly all three.</p></details><details><summary>WHAT ARE THE BOUNDARIES?</summary><p>Strictly 21+. Sex belongs in private, consensual spaces. Drugs belong in private. G/GHB is firmly, fully, not the vibe.</p></details><details><summary>HOW DO I GET THERE?</summary><p>Bus from NYC to Hawley, then the Cove Haven shuttle. Carpools to come. Expect snow and icy roads.</p></details></section>

    <section className="ending"><img src="/images/hot-tub.jpg" alt="A couple enjoying a Cove Haven hot tub"/><div><img src="/images/lincoln-is-for-lovers-logo.png" alt="Lincoln is for Lovers"/><p>JAN 15–18, 2027 · COVE HAVEN</p><a href="#rsvp">RSVP NOW</a></div></section>
  </main>;
}
