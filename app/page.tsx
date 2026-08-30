const days = [
  ['FRIDAY / 01.15', [['6–8 PM','Birthday Banquet','The Coliseum'],['8:30 PM–12 AM','Karaoke with Lazy Suzanne','Lookout Lounge'],['12 AM–???','Wiiinter Pool Party','Iiindoor Spa']]],
  ['SATURDAY / 01.16', [['ALL DAY','Sleep in. Stay in. Recover.','Your love nest'],['8:30–10:30 PM','Let’s Make a Baby','Lookout Lounge'],['11 PM–???','Company of Angels: Revival','Rave Room']]],
  ['SUNDAY / 01.17', [['12–5 PM','Spice Brunch','Spooner’s Theater'],['6–8 PM','Family Dinner','Lookout Lounge'],['9 PM–???','Closing Party','Details TBD']]],
  ['MONDAY / 01.18', [['MORNING','Kiss. Cry. Check out.','Cove Haven']]],
];

const rooms = [
  ['Cove Harbour','Heart-shaped whirlpool, king bed, log-burning fireplace.'],
  ['Juliette','A split-level classic with all the retro essentials.'],
  ['Garden of Eden Apple','A private indoor pool. Temptation without guilt.'],
  ['Champagne Tower','Four stories, seven-foot whirlpool, zero restraint.'],
];

export default function Home(){return <main>
  <nav><a href="#top">TOP</a><a href="#schedule">RUN OF SHOW</a><a href="#rooms">ROOMS</a><a className="nav-rsvp" href="#rsvp">RSVP</a></nav>

  <header id="top" className="hero paper-grain">
    <p className="overline">MLK WEEKEND · COVE HAVEN · POCONOS</p>
    <img className="stamp" src="/images/lincoln-logo-rubber-stamp.png" alt="Lincoln is for Lovers"/>
    <p className="tweakend">50TH BIRTHDAY<br/>TWEAKEND</p>
    <div className="hero-date"><span>JAN</span><strong>15—18</strong><span>2027</span></div>
    <p className="hero-copy">Four days of retro romance, queer spectacle, friendship and extremely specific carpeting.</p>
    <a className="block-button" href="#rsvp">RSVP NOW →</a>
  </header>

  <section className="manifesto paper-grain">
    <p className="section-label">THE INVITATION / 001</p>
    <h1>FIFTY YEARS.<br/><span>ONE VERY</span><br/>DEEP TUB.</h1>
    <p>Bring your boo—or find one there. Cove Haven invented the heart-shaped tub. We intend to honor its legacy.</p>
  </section>

  <figure className="photo-slip"><img src="/images/indoor-pool.jpg" alt="The indoor pool and spa at Cove Haven"/><figcaption>THE IIINDOOR SPA / LAKEVILLE, PA / OPEN VERY LATE</figcaption></figure>

  <section id="schedule" className="schedule paper-grain">
    <p className="section-label">RUN OF SHOW / 002</p><h2>LOSE<br/><span>TRACK</span><br/>OF TIME.</h2>
    <p className="small-intro">Times will shift. Mysteries will deepen. “???” means Lincoln has released us from the tyranny of clocks.</p>
    <div className="day-list">{days.map(([day,events])=><article className="day" key={day as string}><h3>{day as string}</h3>{(events as string[][]).map(([time,name,place])=><div className="event" key={name}><time>{time}</time><strong>{name}</strong><small>{place}</small></div>)}</article>)}</div>
    <aside><b>KEEP IT CUTE.</b><br/>Friday and Saturday share space with other resort guests. Sunday is just family.</aside>
  </section>

  <figure className="photo-slip crooked"><img src="/images/performer.jpg" alt="A performer under starburst lights"/><figcaption>ENTERTAINMENT / PARTICIPATION ENCOURAGED</figcaption></figure>

  <section id="rooms" className="room-section paper-grain">
    <p className="section-label">LOVE NESTS / 003</p><h2>PICK YOUR<br/><span>PLEASURE.</span></h2>
    <div className="room-photo"><img src="/images/champagne-suite.jpg" alt="Champagne Tower suite at Cove Haven"/></div>
    <div className="room-list">{rooms.map(([name,text],i)=><article key={name}><b>0{i+1}</b><h3>{name}</h3><p>{text}</p><a href="https://www.covepoconoresorts.com/cove-haven-resort/rooms">VIEW ROOM ↗</a></article>)}</div>
  </section>

  <section id="rsvp" className="rsvp paper-grain">
    <p className="section-label">DO IT NOW / 004</p><h2>RSVP FIRST.<br/><span>BOOK NEXT.</span></h2>
    <p>Set your status, add your guest, then reserve directly with Cove Haven.</p>
    <form><label>YOUR NAME<input placeholder="First name + last initial"/></label><label>EMAIL<input type="email" placeholder="Private—never displayed"/></label><label>STATUS<select defaultValue=""><option value="" disabled>Choose one</option><option>Definite</option><option>Likely</option><option>Unlikely</option><option>Not Interested</option></select></label><label>ADD A GUEST<input placeholder="First name + last initial"/></label><button type="button">SUBMIT RSVP →</button></form>
  </section>

  <footer className="paper-grain"><img src="/images/lincoln-logo-rubber-stamp.png" alt="Lincoln is for Lovers"/><p>JAN 15—18, 2027 · COVE HAVEN · STRICTLY 21+</p><a href="#top">BACK TO TOP ↑</a></footer>
  </main>}
