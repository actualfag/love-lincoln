const schedule = [
  { day: 'FRI 1/15', note: 'ARRIVE / DINE / SING / SWIM', events: [['Check-in', 'Afternoon', 'Cove Haven'], ['Birthday Banquet', '6–8 PM', 'The Coliseum'], ['Karaoke with Lazy Suzanne', '8:30 PM–12 AM', 'Lookout Lounge'], ['Wiiinter Pool Party', '12 AM–???', 'Iiindoor Spa']] },
  { day: 'SAT 1/16', note: 'RECOVER / ROMANCE / REVIVE', events: [['Free time', 'All day', 'Bed, bath or beyond'], ["Let’s Make a Baby", '8:30–10:30 PM', 'Lookout Lounge'], ['Company of Angels: Revival', '11 PM–???', 'Rave Room']] },
  { day: 'SUN 1/17', note: 'PRIVATE FAMILY PROGRAMMING', events: [['Spice Brunch', '12–5 PM', "Spooner’s Theater"], ['Family Dinner', '6–8 PM', 'Lookout Lounge'], ['Closing Party', '9 PM–???', 'Details forthcoming']] },
  { day: 'MON 1/18', note: 'KISS / CRY / CHECK OUT', events: [['Checkout', 'Morning', 'Until next time, lovers']] },
];

const rooms = [
  ['Cove Harbour', 'THE CLASSIC', 'Heart-shaped whirlpool, king bed and a log-burning fireplace.'],
  ['Juliette', 'THE SPLIT-LEVEL', 'A longtime favorite with all the retro-romantic essentials.'],
  ['Garden of Eden Apple', 'THE TEMPTATION', 'A delightfully excessive playground of romance.'],
  ['Champagne Tower', 'THE ICON', 'Four stories, a seven-foot whirlpool and absolutely no restraint.'],
];

const guests = [['Lincoln M.', 'BOOKED'], ['Lazy S.', 'DEFINITE'], ['Mrs Javiii R.', 'LIKELY'], ['Giovanii P.', 'INVITED'], ['Your name here?', 'RSVP NOW'], ['Regretful R.', 'NOT INTERESTED']];

export default function Home() {
  return (
    <main>
      <div className="topline">PRIVATE-ISH INVITATION · PUBLICLY VIEWABLE · STRICTLY 21+</div>
      <nav className="nav shell">
        <a className="brand" href="#top">L50T</a>
        <div className="navlinks"><a href="#schedule">Schedule</a><a href="#rooms">Rooms</a><a href="#guestlist">Guest list</a><a href="#faq">FAQ</a></div>
        <a className="button small" href="#rsvp">RSVP</a>
      </nav>

      <section className="hero shell" id="top">
        <p className="eyebrow">MLK WEEKEND · JANUARY 15–18, 2027 · COVE HAVEN, PA</p>
        <h1>Lincoln’s 50th<span>Birthday Tweakend</span></h1>
        <div className="hero-grid">
          <p className="lede">Fifty years of Lincoln. Four days of retro romance, queer spectacle, karaoke, pools, friendship and extremely specific carpeting.</p>
          <div className="hero-note"><strong>BRING YOUR BOO—OR FIND ONE THERE.</strong><p>Cove Haven invented the heart-shaped tub. We intend to honor its legacy.</p></div>
        </div>
        <div className="hero-actions"><a className="button" href="#rsvp">I’M COMING</a><a className="textlink" href="#schedule">VIEW THE WEEKEND ↓</a></div>
        <div className="heart" aria-hidden="true"><span>50</span></div>
      </section>

      <section className="marquee" aria-label="Event highlights">★ JAZZ STANDARDS ★ DRAG VARIETY ★ KARAOKE ★ SPICE WORLD ★ RAVE ANGELS ★ WHIRLPOOLS ★</section>

      <section className="section shell" id="schedule">
        <div className="section-head"><div><p className="eyebrow">YOUR RUN OF SHOW</p><h2>A long weekend<br />of bad ideas.</h2></div><p className="sidecopy">Times will shift. Mysteries will deepen. “???” means Lincoln has released us from the tyranny of clocks.</p></div>
        <div className="schedule">{schedule.map((day) => <article className="day" key={day.day}><header><h3>{day.day}</h3><p>{day.note}</p></header><div>{day.events.map(([name, time, place]) => <div className="event" key={name}><strong>{name}</strong><span>{time}</span><em>{place}</em></div>)}</div></article>)}</div>
        <p className="public-note"><strong>A NOTE ON THE GENERAL PUBLIC:</strong> Friday and Saturday events share space with Cove Haven guests. Keep it cute, convivial and appropriate to the room. Sunday is just family.</p>
      </section>

      <section className="section rooms" id="rooms"><div className="shell">
        <div className="section-head light"><div><p className="eyebrow">CHOOSE YOUR LOVE NEST</p><h2>Four levels<br />of romance.</h2></div><p className="sidecopy">Book directly with Cove Haven using our group code. Choose breakfast + dinner. Lunch is purchasable at Spooner’s—or bring snacks.</p></div>
        <div className="room-grid">{rooms.map(([name, label, desc], index) => <article className="room" key={name}><div className={`room-image room-${index + 1}`}><span>ROOM PHOTO</span></div><p>{label}</p><h3>{name}</h3><p className="room-desc">{desc}</p><a href="https://www.covepoconoresorts.com/cove-haven-resort/rooms">SEE ROOM ↗</a></article>)}</div>
        <p className="fineprint">Group booking code and rates coming soon. Vegan and gluten-free meals are available. All invited guests should stay at Cove Haven; contact Lincoln if you have other plans.</p>
      </div></section>

      <section className="section shell" id="rsvp"><div className="rsvp-card">
        <div><p className="eyebrow">DO IT BEFORE YOU FORGET</p><h2>RSVP now.<br />Book next.</h2><p>Tell us your likelihood, add your guest, and share private contact details. After your Cove Haven reservation is confirmed, Lincoln will mark you BOOKED.</p></div>
        <form className="mock-form"><label>YOUR NAME<input placeholder="First name + last initial" /></label><label>EMAIL<input type="email" placeholder="Private—never displayed" /></label><label>STATUS<select defaultValue=""><option value="" disabled>Choose one</option><option>Definite</option><option>Likely</option><option>Unlikely</option><option>Not Interested</option></select></label><label>ADD A GUEST<input placeholder="First name + last initial" /></label><label className="full">OPTIONAL PUBLIC CONTACT<input placeholder="Instagram or Signal" /></label><button type="button">SUBMIT RSVP →</button></form>
      </div></section>

      <section className="section guest-section" id="guestlist"><div className="shell guest-grid">
        <div><p className="eyebrow">WHO’S IN THE TUB?</p><h2>The guest list.</h2><p className="sidecopy">Invitees can add a guest—or another friend who belongs at this campy-ass weekend. New additions notify Lincoln for a quick vibe check.</p></div>
        <div className="guest-list">{guests.map(([name, status], index) => <div className={index === guests.length - 1 ? 'guest declined' : 'guest'} key={name}><strong>{name}</strong><span>{status}</span></div>)}</div>
      </div></section>

      <section className="section shell contribute"><div><p className="eyebrow">MAKE THE WEEKEND</p><h2>Contribute something.</h2></div><div className="contribution-grid">{['I WOULD LIKE TO PERFORM', 'CLEAN-UP CREW', 'WRANGLING', 'VIBE-CHECKING'].map((item, i) => <button key={item}><span>0{i + 1}</span>{item}</button>)}</div><a className="button" href="#rsvp">OPEN CONTRIBUTION FORM</a></section>

      <section className="section faq" id="faq"><div className="shell faq-grid"><div><p className="eyebrow">FREQUENTLY ANTICIPATED</p><h2>Keep it cute.</h2></div><div>
        <details open><summary>What’s the vibe?</summary><p>Glamorous retro-romance with club innuendo. Dress for camp, comfort, a snowstorm and possibly all three.</p></details>
        <details><summary>What are the house rules?</summary><p>Strictly 21+. Sex belongs in private, consensual spaces. Drugs belong in private. G/GHB is not welcome here—firmly, fully, not the vibe.</p></details>
        <details><summary>How do I get there?</summary><p>Buses run from NYC to Hawley, where the Cove Haven shuttle can collect you. Carpools will be coordinated. It is January in the Poconos: expect snow and icy roads.</p></details>
        <details><summary>What about accessibility?</summary><p>Single-level accessible rooms are available near our main building. Contact Lincoln or call the resort to discuss your needs.</p></details>
      </div></div></section>

      <section className="section message-board shell"><div><p className="eyebrow">PUBLIC TO READ · GUESTS ONLY TO POST</p><h2>Leave a message.</h2></div><div className="messages"><blockquote>“Does the pool party dress code include a coat?”<cite>— Future Guest</cite></blockquote><blockquote>“I have already begun vocal warmups.”<cite>— Lazy S.</cite></blockquote><button>ADD A MESSAGE →</button></div></section>
      <footer><div className="shell"><strong>LINCOLN’S 50TH BIRTHDAY TWEAKEND</strong><span>JAN 15–18, 2027 · COVE HAVEN, PA</span><a href="#top">BACK TO TOP ↑</a></div></footer>
    </main>
  );
}
