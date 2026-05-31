import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ClipboardList,
  Download,
  FileUp,
  Layers,
  ShieldCheck,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

// ─── brand tokens ──────────────────────────────────────────────────────────────
const TM = {
  maroon: "#7B1F2E",
  gold: "#F0AB00",
  maroonLight: "#F5E8EA",
  goldLight: "#FEF9E7"
};

// ─── constants ─────────────────────────────────────────────────────────────────

const defaultMembers = [
  "Member 1", "Member 2", "Member 3", "Member 4",
  "Member 5", "Member 6", "Member 7", "Member 8"
];
const defaultOfficers = ["President", "VPE", "VPM", "VPPR", "Secretary", "Treasurer", "SAA"];

const presidingOfficerModes = {
  fixedPresident: "Fixed President / Club Chair",
  officerRotation: "Officer Rotation",
  qualifiedMemberRotation: "Qualified Member Rotation with Officer Backup",
  combinedWithToastmaster: "Combined Presiding Officer + Toastmaster",
  openRole: "Open Role / Manual Assignment"
};

const standardRoles = [
  "Presiding Officer","Toastmaster","Speaker 1","Speaker 2","Speaker 3",
  "Table Topicsmaster","General Evaluator","Evaluator 1","Evaluator 2",
  "Evaluator 3","Grammarian","Ah-Counter","Timer"
];
const workshopRoles = [
  "Presiding Officer","Education Lead","Workshop Speaker","Table Topicsmaster",
  "General Evaluator","Primary Evaluator","Supplemental Evaluators",
  "Grammarian","Ah-Counter","Timer"
];

const agendaTemplates = {
  standard: { label:"Standard Meeting", description:"Traditional club meeting with prepared speeches, Table Topics, evaluations, and listening roles.", roles:standardRoles },
  workshop: { label:"Workshop / Advanced Format", description:"Education-focused meeting for Level 4–5 projects, skill clinics, or longer learning segments.", roles:workshopRoles },
  speechMarathon: { label:"Speech Marathon", description:"High-volume prepared speech meeting for Pathways progress, contest preparation, or project completion.", roles:["Presiding Officer","Toastmaster","Speaker 1","Speaker 2","Speaker 3","Speaker 4","Evaluator 1","Evaluator 2","Evaluator 3","Evaluator 4","Timer"] },
  tableTopicsIntensive: { label:"Table Topics Intensive", description:"Impromptu-speaking heavy format for guest-heavy meetings, low-speaker weeks, or quick-thinking development.", roles:["Presiding Officer","Toastmaster","Table Topicsmaster","Topics Evaluator","Grammarian","Ah-Counter","Timer"] },
  openHouse: { label:"Open House / Guest Conversion", description:"Guest-friendly meeting with a polished speaker, testimonials, Table Topics, and a clear invitation to join.", roles:["Host","Presiding Officer","Toastmaster","Featured Speaker","Table Topicsmaster","Guest Experience Lead","Membership Pitch","Timer"] },
  contestPrep: { label:"Contest Prep", description:"Contest rehearsal format for speeches, evaluations, timing discipline, and ballot-style feedback.", roles:["Contest Chair / Facilitator","Contest Speaker 1","Contest Speaker 2","Contest Speaker 3","Chief Judge / Feedback Lead","Evaluator 1","Evaluator 2","Timer","Ballot Counter"] },
  evaluationClinic: { label:"Evaluation Clinic", description:"Training format focused on stronger evaluations, feedback structure, and evaluator calibration.", roles:["Presiding Officer","Clinic Facilitator","Speaker 1","Primary Evaluator","Evaluator 2","Evaluator 3","General Evaluator","Timer"] },
  clubSuccessPlanning: { label:"Club Success Planning", description:"Governance meeting for Club Success Plan review, member goals, officer alignment, and program-year planning.", roles:["Presiding Officer","VPE / Planning Lead","VPM / Membership Lead","VPPR / Promotion Lead","Secretary / Notes","Treasurer / Dues Update","Member Goals Facilitator","Timer"] },
  specialShowcase: { label:"Special Showcase", description:"Theme-driven special meeting for anniversaries, recognition, storytelling, holidays, or community events.", roles:["Host","Toastmaster","Showcase Speaker 1","Showcase Speaker 2","Recognition Lead","Table Topicsmaster","Timer"] }
};

const agendaPatternOptions = {
  threeOneOne: "3-1-1: Three Standard, one Workshop, 5th-week Bonus",
  hybrid: "Hybrid: 1st/3rd Standard, 2nd/4th Workshop, 5th Special",
  standardOnly: "Standard format for every scheduled meeting",
  workshopOnly: "Workshop / advanced format every scheduled meeting",
  speechMarathon: "Speech marathon every scheduled meeting",
  tableTopicsIntensive: "Table Topics intensive every scheduled meeting",
  openHouse: "Open house / guest conversion every scheduled meeting",
  contestPrep: "Contest prep every scheduled meeting",
  evaluationClinic: "Evaluation clinic every scheduled meeting",
  clubSuccessPlanning: "Club success planning every scheduled meeting",
  specialShowcase: "Special showcase every scheduled meeting",
  growthCycle: "Growth cycle: Standard, Workshop, Table Topics, Open House",
  educationCycle: "Education cycle: Standard, Speech Marathon, Evaluation Clinic, Workshop",
  membershipCycle: "Membership cycle: Standard, Open House, Table Topics, Showcase"
};

// All 6 year arcs for both cycles
const allYearArcs = [
  { year:1, arc:"Personal Growth",       cycle:"Formation", desc:"Confidence, courage, discipline, and self-leadership." },
  { year:2, arc:"Leadership & Influence", cycle:"Formation", desc:"Service, persuasion, teamwork, and accountability." },
  { year:3, arc:"Legacy & Impact",        cycle:"Formation", desc:"Mentoring, stewardship, contribution, and continuity." },
  { year:4, arc:"Communication Mastery",  cycle:"Mastery",   desc:"Storytelling, rhetoric, clarity, and executive presence." },
  { year:5, arc:"Strategic Leadership",   cycle:"Mastery",   desc:"Vision, planning, conflict resolution, and decision-making." },
  { year:6, arc:"Institutional Legacy",   cycle:"Mastery",   desc:"Culture, succession, governance, and transformation." }
];

// ─── 72-month theme library ────────────────────────────────────────────────────
// Cycle 1 — Formation (Years 1–3) — 9 monthly blocks × 4 meetings = 36 entries
// Cycle 2 — Mastery  (Years 4–6) — 9 monthly blocks × 4 meetings = 36 entries
// Total: 72 entries

const themeLibrary = [
  // ── CYCLE 1: FORMATION ─────────────────────────────────────────────────────
  {
    arc:"Personal Growth", monthlyTheme:"Vision", cycle:"Formation",
    meetings:[
      { theme:"Seeing the Future",   word:"Foresight",  advanced:"Prescience",    partOfSpeech:"noun",      definition:"The ability to anticipate what may happen or be needed.",          example:"A strong speaker uses foresight to prepare for audience questions." },
      { theme:"Setting Direction",   word:"Purpose",    advanced:"Intentionality", partOfSpeech:"noun",      definition:"A clear reason or aim behind action.",                            example:"Her purpose gave the speech structure and force." },
      { theme:"Pursuing Goals",      word:"Momentum",   advanced:"Trajectory",    partOfSpeech:"noun",      definition:"Forward movement that builds over time.",                         example:"The club gained momentum after members accepted roles early." },
      { theme:"Course Correction",   word:"Adjust",     advanced:"Recalibrate",   partOfSpeech:"verb",      definition:"To modify direction after reviewing results.",                     example:"A VPE may recalibrate the agenda after a speaker cancels." }
    ]
  },
  {
    arc:"Personal Growth", monthlyTheme:"Courage", cycle:"Formation",
    meetings:[
      { theme:"Speaking Through Fear",       word:"Courage",   advanced:"Fortitude",  partOfSpeech:"noun",      definition:"Strength in the face of fear, pain, or difficulty.",       example:"Fortitude helps new speakers return to the lectern." },
      { theme:"Taking the First Step",       word:"Initiative",advanced:"Enterprise", partOfSpeech:"noun",      definition:"The readiness to begin without being forced.",               example:"She showed initiative by volunteering for Table Topics." },
      { theme:"Risk and Growth",             word:"Bold",      advanced:"Intrepid",   partOfSpeech:"adjective", definition:"Fearless, adventurous, or willing to act despite risk.",     example:"His intrepid opening immediately captured attention." },
      { theme:"Confidence Under Pressure",   word:"Composed",  advanced:"Equanimous", partOfSpeech:"adjective", definition:"Calm and steady, especially under stress.",                  example:"An equanimous evaluator gives clear feedback without tension." }
    ]
  },
  {
    arc:"Personal Growth", monthlyTheme:"Discipline", cycle:"Formation",
    meetings:[
      { theme:"Practice Before Performance", word:"Practice",  advanced:"Repetition",  partOfSpeech:"noun",      definition:"Repeated effort used to improve skill.",                        example:"Repetition turns a speech from memorized text into natural delivery." },
      { theme:"Preparation Habits",          word:"Prepared",  advanced:"Meticulous",  partOfSpeech:"adjective", definition:"Extremely careful and attentive to detail.",                     example:"A meticulous Toastmaster checks names, titles, and timing." },
      { theme:"Time Stewardship",            word:"Timely",    advanced:"Punctilious", partOfSpeech:"adjective", definition:"Careful about exactness, rules, or proper conduct.",              example:"A punctilious timer protects the meeting agenda." },
      { theme:"Consistency Wins",            word:"Steady",    advanced:"Assiduous",   partOfSpeech:"adjective", definition:"Showing great care and persistent effort.",                        example:"Assiduous members improve faster because they keep showing up." }
    ]
  },
  {
    arc:"Leadership & Influence", monthlyTheme:"Leadership", cycle:"Formation",
    meetings:[
      { theme:"Leading Through Service",   word:"Service",    advanced:"Stewardship", partOfSpeech:"noun",      definition:"Responsible care for people, duties, or resources.",             example:"Stewardship turns a club officer role into leadership practice." },
      { theme:"Influence Without Authority",word:"Influence", advanced:"Persuasion",  partOfSpeech:"noun",      definition:"The ability to affect thinking or action.",                      example:"Persuasion depends on trust, not volume." },
      { theme:"Trust and Credibility",     word:"Credible",   advanced:"Authenticity",partOfSpeech:"noun",      definition:"The quality of being genuine and trustworthy.",                  example:"Authenticity makes a personal story more persuasive." },
      { theme:"Decision and Ownership",    word:"Accountable",advanced:"Answerable",  partOfSpeech:"adjective", definition:"Responsible for actions, results, or obligations.",               example:"An answerable leader owns both the plan and the outcome." }
    ]
  },
  {
    arc:"Leadership & Influence", monthlyTheme:"Communication", cycle:"Formation",
    meetings:[
      { theme:"Clear Messages",              word:"Clear",   advanced:"Cogent",      partOfSpeech:"adjective", definition:"Clear, logical, and convincing.",                              example:"A cogent speech is easy to follow and hard to dismiss." },
      { theme:"Speaking with Precision",     word:"Precise", advanced:"Articulate",  partOfSpeech:"adjective", definition:"Able to express ideas clearly and effectively.",               example:"An articulate speaker chooses words with care." },
      { theme:"Listening Before Responding", word:"Listen",  advanced:"Attentive",   partOfSpeech:"adjective", definition:"Closely observant and actively focused.",                       example:"An attentive evaluator hears both content and delivery." },
      { theme:"Memorable Language",          word:"Vivid",   advanced:"Evocative",   partOfSpeech:"adjective", definition:"Bringing strong images, feelings, or memories to mind.",       example:"Evocative language helps the audience see the scene." }
    ]
  },
  {
    arc:"Leadership & Influence", monthlyTheme:"Teamwork", cycle:"Formation",
    meetings:[
      { theme:"Shared Responsibility", word:"Collaborate",advanced:"Synergy",     partOfSpeech:"noun",      definition:"Combined effort producing a result greater than separate efforts.", example:"Synergy appears when speakers, evaluators, and officers prepare together." },
      { theme:"Role Reliability",      word:"Reliable",    advanced:"Dependable",  partOfSpeech:"adjective", definition:"Consistently able to be trusted or counted on.",                   example:"A dependable member confirms roles before the agenda is published." },
      { theme:"Healthy Conflict",      word:"Tact",        advanced:"Diplomacy",   partOfSpeech:"noun",      definition:"Skill in handling people or disagreement with care.",               example:"Diplomacy lets leaders correct problems without creating resentment." },
      { theme:"Mutual Support",        word:"Support",     advanced:"Reciprocity", partOfSpeech:"noun",      definition:"The practice of mutual exchange or mutual benefit.",                example:"Reciprocity strengthens a club culture when members help each other grow." }
    ]
  },
  {
    arc:"Legacy & Impact", monthlyTheme:"Legacy", cycle:"Formation",
    meetings:[
      { theme:"What We Leave Behind",       word:"Legacy",   advanced:"Inheritance",partOfSpeech:"noun", definition:"Something received from those who came before or passed to those who follow.", example:"A club's inheritance is its culture, habits, and standards." },
      { theme:"Impact Beyond the Room",     word:"Impact",   advanced:"Consequence",partOfSpeech:"noun", definition:"A result or effect that follows from an action.",                               example:"The consequence of one good speech can extend beyond the meeting." },
      { theme:"Mentoring the Next Speaker", word:"Mentor",   advanced:"Cultivate",  partOfSpeech:"verb", definition:"To develop, encourage, or improve over time.",                                 example:"Experienced members cultivate confidence in newer speakers." },
      { theme:"Building What Lasts",        word:"Enduring", advanced:"Perennial",  partOfSpeech:"adjective",definition:"Lasting for a long time or continually recurring.",                         example:"A perennial club tradition can shape member identity." }
    ]
  },
  {
    arc:"Legacy & Impact", monthlyTheme:"Innovation", cycle:"Formation",
    meetings:[
      { theme:"New Methods",          word:"Innovate",   advanced:"Ingenuity",   partOfSpeech:"noun",      definition:"Cleverness, originality, or inventiveness in solving problems.",      example:"Ingenuity helps a club redesign a stale meeting format." },
      { theme:"Adapting to Change",   word:"Adapt",      advanced:"Versatile",   partOfSpeech:"adjective", definition:"Able to adjust to many different situations.",                        example:"A versatile Toastmaster can manage changes without losing control." },
      { theme:"Experiment and Learn", word:"Experiment", advanced:"Iterate",     partOfSpeech:"verb",      definition:"To improve through repeated testing and adjustment.",                 example:"The VPE can iterate the agenda format based on member feedback." },
      { theme:"Creative Solutions",   word:"Creative",   advanced:"Resourceful", partOfSpeech:"adjective", definition:"Able to solve problems using available tools and imagination.",       example:"A resourceful officer finds a backup speaker before the agenda collapses." }
    ]
  },
  {
    arc:"Legacy & Impact", monthlyTheme:"Wisdom", cycle:"Formation",
    meetings:[
      { theme:"Learning from Experience", word:"Wisdom",    advanced:"Sagacity",    partOfSpeech:"noun",      definition:"Sound judgment developed through experience and reflection.",         example:"Sagacity helps an evaluator know what feedback matters most." },
      { theme:"Choosing Well",            word:"Judgment",  advanced:"Discernment", partOfSpeech:"noun",      definition:"The ability to perceive, distinguish, and choose wisely.",            example:"Discernment helps a speaker decide what to leave out." },
      { theme:"Thinking Before Speaking", word:"Thoughtful",advanced:"Circumspect", partOfSpeech:"adjective", definition:"Careful to consider possible consequences before acting.",            example:"A circumspect leader corrects behavior privately and respectfully." },
      { theme:"Practical Understanding",  word:"Practical", advanced:"Pragmatic",   partOfSpeech:"adjective", definition:"Focused on what works in real conditions.",                           example:"A pragmatic agenda solves the actual meeting problem." }
    ]
  },

  // ── CYCLE 2: MASTERY ───────────────────────────────────────────────────────
  {
    arc:"Communication Mastery", monthlyTheme:"Storytelling", cycle:"Mastery",
    meetings:[
      { theme:"The Power of Narrative",  word:"Story",     advanced:"Narrative",   partOfSpeech:"noun", definition:"A structured account that gives meaning to events.",                      example:"A speaker who uses narrative carries the audience through experience, not just information." },
      { theme:"Emotional Truth",         word:"Resonance", advanced:"Pathos",      partOfSpeech:"noun", definition:"An appeal to the emotions of an audience.",                               example:"Pathos in a speech moves people because it speaks to shared human experience." },
      { theme:"Scene and Specificity",   word:"Specific",  advanced:"Granular",    partOfSpeech:"adjective",definition:"Detailed enough to produce a clear mental image.",                    example:"Granular storytelling places the audience inside the moment." },
      { theme:"The Story Arc",           word:"Structure", advanced:"Denouement",  partOfSpeech:"noun", definition:"The final part of a narrative where matters are explained or resolved.",   example:"A speech with a clear denouement leaves the audience satisfied." }
    ]
  },
  {
    arc:"Communication Mastery", monthlyTheme:"Rhetoric", cycle:"Mastery",
    meetings:[
      { theme:"The Art of Persuasion",  word:"Persuade",  advanced:"Rhetoric",   partOfSpeech:"noun", definition:"The art of effective or persuasive speaking or writing.",                      example:"Rhetoric gives speakers the tools to move thinking, not just share facts." },
      { theme:"Logical Appeals",         word:"Logic",     advanced:"Syllogism",  partOfSpeech:"noun", definition:"A form of deductive reasoning consisting of a major premise, minor premise, and conclusion.", example:"A syllogism makes an argument feel airtight when both premises are solid." },
      { theme:"Figures of Speech",       word:"Metaphor",  advanced:"Aphorism",   partOfSpeech:"noun", definition:"A short statement expressing a general truth or insight.",                        example:"A well-placed aphorism can become the most memorable line in a speech." },
      { theme:"Repetition and Rhythm",   word:"Repetition",advanced:"Anaphora",   partOfSpeech:"noun", definition:"The repetition of a word or phrase at the beginning of successive clauses.",       example:"Anaphora builds momentum: 'We will not stop, we will not fail, we will not rest.'" }
    ]
  },
  {
    arc:"Communication Mastery", monthlyTheme:"Executive Presence", cycle:"Mastery",
    meetings:[
      { theme:"Command the Room",     word:"Presence",  advanced:"Gravitas",      partOfSpeech:"noun",      definition:"Dignity, seriousness, or solemnity of manner.",                         example:"A leader with gravitas commands attention without demanding it." },
      { theme:"The Leadership Voice", word:"Confident", advanced:"Authoritative", partOfSpeech:"adjective", definition:"Having or showing authority; commanding.",                               example:"An authoritative tone communicates certainty without arrogance." },
      { theme:"Composure Under Fire", word:"Composure", advanced:"Sangfroid",     partOfSpeech:"noun",      definition:"Coolness and composure, especially in difficult situations.",             example:"Sangfroid during Q&A signals that a leader has thought through the problem deeply." },
      { theme:"Authentic Authority",  word:"Genuine",   advanced:"Congruent",     partOfSpeech:"adjective", definition:"In agreement or harmony; consistent in words, tone, and action.",        example:"A congruent speaker's words, tone, and body language all send the same message." }
    ]
  },
  {
    arc:"Strategic Leadership", monthlyTheme:"Strategic Vision", cycle:"Mastery",
    meetings:[
      { theme:"Thinking Long-Term",             word:"Vision",    advanced:"Prescient",  partOfSpeech:"adjective", definition:"Having or showing knowledge of what is needed before it becomes obvious.", example:"A prescient leader anticipates member needs before they become problems." },
      { theme:"Setting Organizational Direction",word:"Mission",   advanced:"Telos",      partOfSpeech:"noun",      definition:"An ultimate object or aim; a defining purpose.",                              example:"Clarity of telos prevents a club from drifting through the program year without momentum." },
      { theme:"Aligning People to Purpose",     word:"Alignment", advanced:"Cohesion",   partOfSpeech:"noun",      definition:"The action or fact of forming a united whole.",                               example:"Cohesion between officers turns individual effort into collective achievement." },
      { theme:"Measuring What Matters",         word:"Standard",  advanced:"Criterion",  partOfSpeech:"noun",      definition:"A principle or standard by which something may be judged.",                    example:"Without a clear criterion, a club cannot know whether it is succeeding." }
    ]
  },
  {
    arc:"Strategic Leadership", monthlyTheme:"Planning & Execution", cycle:"Mastery",
    meetings:[
      { theme:"From Intention to Action", word:"Plan",     advanced:"Operationalize",partOfSpeech:"verb",      definition:"To put into operation; to make a strategy functional.",                   example:"A VPE who can operationalize a vision converts strategy into meeting reality." },
      { theme:"Prioritizing the Right Work",word:"Priority",advanced:"Exigency",    partOfSpeech:"noun",      definition:"A situation that requires immediate action.",                              example:"Recognizing the exigency of a last-minute cancellation is a key VPE skill." },
      { theme:"Adapting to Disruption",    word:"Adapt",    advanced:"Contingent",   partOfSpeech:"adjective", definition:"Subject to chance; dependent on conditions not yet certain.",               example:"All great meeting plans are contingent — the best VPEs prepare for that." },
      { theme:"Building Repeatable Systems",word:"System",  advanced:"Protocol",     partOfSpeech:"noun",      definition:"A set of rules governing the procedures for an activity.",                  example:"A meeting protocol maintained across officer terms protects institutional memory." }
    ]
  },
  {
    arc:"Strategic Leadership", monthlyTheme:"Navigating Conflict", cycle:"Mastery",
    meetings:[
      { theme:"Conflict as Information",   word:"Tension",   advanced:"Dialectic",  partOfSpeech:"noun", definition:"The art of investigating or discussing the truth of opinions through reasoned argument.", example:"Dialectic in a club meeting surfaces disagreement early, when it is still productive." },
      { theme:"Productive Disagreement",   word:"Debate",    advanced:"Discourse",  partOfSpeech:"noun", definition:"Written or spoken communication or debate.",                                             example:"Civil discourse produces better decisions than premature agreement." },
      { theme:"Finding Common Ground",     word:"Compromise",advanced:"Consensus",  partOfSpeech:"noun", definition:"General agreement, especially in the absence of opposition.",                            example:"Consensus means everyone can live with the decision, not that everyone agrees completely." },
      { theme:"Repairing Relationships",   word:"Restore",   advanced:"Reconcile",  partOfSpeech:"verb", definition:"To restore friendly relations; to make compatible.",                                      example:"A leader who can reconcile disagreeing members strengthens the whole club." }
    ]
  },
  {
    arc:"Institutional Legacy", monthlyTheme:"Building Culture", cycle:"Mastery",
    meetings:[
      { theme:"What Culture Actually Is", word:"Culture",  advanced:"Ethos",      partOfSpeech:"noun", definition:"The characteristic spirit of a culture, era, or community.",                      example:"A club's ethos is visible in how members treat each other before and after the meeting." },
      { theme:"Rituals and Habits",        word:"Ritual",   advanced:"Convention", partOfSpeech:"noun", definition:"An established practice; a way in which something is usually done.",                example:"Convention gives new members a sense of what the club values and how it operates." },
      { theme:"Welcoming the Newcomer",    word:"Welcome",  advanced:"Hospitality",partOfSpeech:"noun", definition:"The generous and friendly reception of guests.",                                    example:"Hospitality is not just refreshments — it is the emotional climate a guest walks into." },
      { theme:"Standards and Expectations",word:"Standard", advanced:"Benchmark",  partOfSpeech:"noun", definition:"A standard or point of reference for evaluating performance.",                     example:"A club that benchmarks its meetings against its own best performances grows faster." }
    ]
  },
  {
    arc:"Institutional Legacy", monthlyTheme:"Succession & Continuity", cycle:"Mastery",
    meetings:[
      { theme:"Preparing the Next Leader", word:"Mentor",    advanced:"Steward",   partOfSpeech:"verb", definition:"To manage or look after with care; to protect for future use.",            example:"An officer who stewards their role prepares their successor as much as they serve the present club." },
      { theme:"Institutional Memory",      word:"Document",  advanced:"Chronicle", partOfSpeech:"verb", definition:"To record in detail; to give a factual account over time.",                  example:"A VPE who chronicles the program year leaves a gift for the officer who follows." },
      { theme:"Transitions That Work",     word:"Transition",advanced:"Handoff",   partOfSpeech:"noun", definition:"The transfer of authority, responsibility, or knowledge from one person to another.", example:"A clean handoff protects the club from losing momentum between officer terms." },
      { theme:"Lasting Contribution",      word:"Contribute",advanced:"Endow",     partOfSpeech:"verb", definition:"To provide with a lasting quality, income, or structural feature.",           example:"Members who endow the club with strong systems outlast their own tenure." }
    ]
  },
  {
    arc:"Institutional Legacy", monthlyTheme:"Transformational Impact", cycle:"Mastery",
    meetings:[
      { theme:"Leading Change",          word:"Change",  advanced:"Catalyze",   partOfSpeech:"verb", definition:"To cause or accelerate a reaction or change.",                                   example:"A confident VPE can catalyze new habits without forcing compliance." },
      { theme:"Vision Realized",         word:"Achieve", advanced:"Actualize",  partOfSpeech:"verb", definition:"To make actual or real; to convert into action or fact.",                        example:"When a club actualizes its mission, members feel the difference in every meeting." },
      { theme:"Growth That Compounds",   word:"Growth",  advanced:"Accretion",  partOfSpeech:"noun", definition:"The process of growth or increase, typically by gradual accumulation.",           example:"Member confidence grows through accretion — small gains that build across many meetings." },
      { theme:"The Club You Build",      word:"Legacy",  advanced:"Testament",  partOfSpeech:"noun", definition:"Something that serves as evidence or proof of a specified fact or quality.",      example:"A strong club culture is a testament to every member who showed up and did the work." }
    ]
  }
];

// ─── theme helpers ─────────────────────────────────────────────────────────────

function flattenLibrary(library) {
  return library.flatMap((block, bi) =>
    block.meetings.map((meeting, mi) => ({
      ...meeting,
      arc: block.arc,
      monthlyTheme: block.monthlyTheme,
      cycle: block.cycle,
      libraryIndex: bi * 4 + mi
    }))
  );
}

const corePool  = flattenLibrary(themeLibrary.slice(0, 9));   // 36 entries — Formation
const masterPool = flattenLibrary(themeLibrary);              // 72 entries — Formation + Mastery

// ─── phase 4: standalone word bank ────────────────────────────────────────────
// Words are separate from theme entries; selected by tag, level, and repeat history.
// Tags match monthlyTheme slugs (lowercase, hyphenated).

const wordBank = [
  // ── standard words ──
  { id:"wb-s01", word:"Clarity",        partOfSpeech:"noun",      level:"standard", tags:["vision","communication"],             definition:"The quality of being clear, coherent, and easy to understand.",              example:"Clarity in a speech title sets audience expectations before the first word." },
  { id:"wb-s02", word:"Boldness",       partOfSpeech:"noun",      level:"standard", tags:["courage"],                            definition:"Willingness to take risks or act with confidence.",                          example:"Boldness in Table Topics separates a good answer from a memorable one." },
  { id:"wb-s03", word:"Diligence",      partOfSpeech:"noun",      level:"standard", tags:["discipline"],                         definition:"Careful and persistent effort toward a goal.",                               example:"Diligence in preparation is visible the moment a speaker opens their mouth." },
  { id:"wb-s04", word:"Integrity",      partOfSpeech:"noun",      level:"standard", tags:["leadership","building-culture"],      definition:"Adherence to moral and ethical principles; soundness of character.",           example:"Integrity means the club's stated values match what members actually experience." },
  { id:"wb-s05", word:"Eloquence",      partOfSpeech:"noun",      level:"standard", tags:["communication","rhetoric"],           definition:"The quality of expressing ideas fluently, forcefully, and persuasively.",      example:"Eloquence is not vocabulary — it is the right word at the right moment." },
  { id:"wb-s06", word:"Solidarity",     partOfSpeech:"noun",      level:"standard", tags:["teamwork","building-culture"],        definition:"Unity or agreement among members of a group.",                               example:"Solidarity means members show up for each other's speeches, not just their own." },
  { id:"wb-s07", word:"Heritage",       partOfSpeech:"noun",      level:"standard", tags:["legacy","succession-continuity"],     definition:"Traditions, achievements, or values passed down within a community.",         example:"A club's heritage is what new members absorb before anyone explains the rules." },
  { id:"wb-s08", word:"Originality",    partOfSpeech:"noun",      level:"standard", tags:["innovation"],                         definition:"The ability to think or express oneself in an independent or creative way.",   example:"Originality in a speech opening creates immediate attention." },
  { id:"wb-s09", word:"Prudence",       partOfSpeech:"noun",      level:"standard", tags:["wisdom","planning-execution"],        definition:"Careful, sensible judgment that avoids unnecessary risk.",                     example:"Prudence tells a VPE when to confirm a speaker and when to find a backup." },
  { id:"wb-s10", word:"Anecdote",       partOfSpeech:"noun",      level:"standard", tags:["storytelling"],                       definition:"A short personal account used to illustrate or humanize a point.",             example:"An anecdote at the opening of a speech earns the audience's trust." },
  { id:"wb-s11", word:"Diction",        partOfSpeech:"noun",      level:"standard", tags:["rhetoric","executive-presence"],      definition:"The choice and use of words in speech or writing.",                           example:"Strong diction means every word carries weight and earns its place." },
  { id:"wb-s12", word:"Poise",          partOfSpeech:"noun",      level:"standard", tags:["executive-presence","courage"],       definition:"Graceful and composed ease of manner.",                                       example:"Poise under questioning signals that a leader has done the work to be ready." },
  { id:"wb-s13", word:"Strategy",       partOfSpeech:"noun",      level:"standard", tags:["strategic-vision"],                   definition:"A plan of action designed to achieve a long-term goal.",                      example:"A club strategy connects meeting design to member development outcomes." },
  { id:"wb-s14", word:"Preparation",    partOfSpeech:"noun",      level:"standard", tags:["planning-execution","discipline"],    definition:"The action of making ready in advance.",                                      example:"Preparation is the difference between a smooth meeting and a chaotic one." },
  { id:"wb-s15", word:"Mediation",      partOfSpeech:"noun",      level:"standard", tags:["navigating-conflict"],                definition:"Intervention to assist parties in reaching agreement.",                       example:"Skilled mediation lets both sides feel heard before a solution emerges." },
  { id:"wb-s16", word:"Community",      partOfSpeech:"noun",      level:"standard", tags:["building-culture","teamwork"],        definition:"A group united by shared values, purpose, or experience.",                     example:"Community is what makes members attend even when they have nothing on the agenda." },
  { id:"wb-s17", word:"Continuity",     partOfSpeech:"noun",      level:"standard", tags:["succession-continuity","legacy"],     definition:"Unbroken connection or consistency across time.",                              example:"Continuity in a club's culture survives officer turnover when documented well." },
  { id:"wb-s18", word:"Transformation", partOfSpeech:"noun",      level:"standard", tags:["transformational-impact"],            definition:"A thorough or dramatic change in form, nature, or character.",                 example:"Transformation in a speaker is visible when they stop reading notes and start speaking." },
  // ── advanced words ──
  { id:"wb-a01", word:"Perspicacity",   partOfSpeech:"noun",      level:"advanced", tags:["vision","wisdom"],                   definition:"The ability to notice and understand things clearly.",                         example:"Perspicacity helps a VPE see member potential before the member does." },
  { id:"wb-a02", word:"Temerity",       partOfSpeech:"noun",      level:"advanced", tags:["courage"],                            definition:"Excessive confidence or boldness; audacity.",                                 example:"Temerity in Table Topics is a feature, not a flaw — the audience rewards it." },
  { id:"wb-a03", word:"Assiduousness",  partOfSpeech:"noun",      level:"advanced", tags:["discipline"],                         definition:"The quality of working with constant and careful attention.",                  example:"Assiduousness in rehearsal is what separates polished speakers from prepared ones." },
  { id:"wb-a04", word:"Rectitude",      partOfSpeech:"noun",      level:"advanced", tags:["leadership","building-culture"],      definition:"Morally correct behavior or thinking; uprightness.",                           example:"Rectitude in leadership means the decision is the same whether or not anyone is watching." },
  { id:"wb-a05", word:"Loquacity",      partOfSpeech:"noun",      level:"advanced", tags:["communication","rhetoric"],           definition:"The tendency to talk a great deal; talkativeness with skill.",                  example:"Loquacity without structure fills time; loquacity with structure commands it." },
  { id:"wb-a06", word:"Esprit de corps",partOfSpeech:"noun",      level:"advanced", tags:["teamwork","building-culture"],        definition:"The common spirit of loyalty and enthusiasm shared by members of a group.",   example:"Esprit de corps is why members applaud an imperfect speaker just as hard as a great one." },
  { id:"wb-a07", word:"Patrimony",      partOfSpeech:"noun",      level:"advanced", tags:["legacy","succession-continuity"],     definition:"Cultural or institutional heritage passed from previous generations.",          example:"The club's patrimony includes every manual, speech, and standard ever set." },
  { id:"wb-a08", word:"Ingeniousness",  partOfSpeech:"noun",      level:"advanced", tags:["innovation"],                         definition:"The quality of being clever, original, and inventive.",                        example:"Ingeniousness in agenda design keeps meetings from becoming predictable." },
  { id:"wb-a09", word:"Acumen",         partOfSpeech:"noun",      level:"advanced", tags:["wisdom","strategic-vision"],          definition:"The ability to make quick, accurate judgments.",                               example:"Business acumen and speaking acumen share a root: the ability to read the room." },
  { id:"wb-a10", word:"Verisimilitude", partOfSpeech:"noun",      level:"advanced", tags:["storytelling"],                       definition:"The appearance of being true or real.",                                       example:"Verisimilitude in a personal story comes from specific detail, not embellishment." },
  { id:"wb-a11", word:"Oratory",        partOfSpeech:"noun",      level:"advanced", tags:["rhetoric"],                           definition:"The art or practice of formal speaking in public.",                            example:"Oratory is not loud speech — it is speech that earns its stage." },
  { id:"wb-a12", word:"Aplomb",         partOfSpeech:"noun",      level:"advanced", tags:["executive-presence"],                 definition:"Self-confidence and composure, especially in difficult situations.",            example:"Aplomb during an unexpected question defines a speaker's reputation in the room." },
  { id:"wb-a13", word:"Teleological",   partOfSpeech:"adjective", level:"advanced", tags:["strategic-vision"],                   definition:"Relating to explanation by reference to purpose or end goal.",                  example:"A teleological approach to club programming asks: what should members become?" },
  { id:"wb-a14", word:"Preparedness",   partOfSpeech:"noun",      level:"advanced", tags:["planning-execution"],                 definition:"The state of being fully ready for a situation.",                              example:"Preparedness as a club standard means every role is confirmed 48 hours early." },
  { id:"wb-a15", word:"Arbitration",    partOfSpeech:"noun",      level:"advanced", tags:["navigating-conflict"],                definition:"The use of an impartial party to settle a dispute.",                           example:"Arbitration requires both parties to trust the process before they trust the outcome." },
  { id:"wb-a16", word:"Camaraderie",    partOfSpeech:"noun",      level:"advanced", tags:["building-culture","teamwork"],        definition:"Mutual trust and friendship among people who spend time together.",             example:"Camaraderie is the invisible force that makes a member stay when the meeting runs long." },
  { id:"wb-a17", word:"Perpetuity",     partOfSpeech:"noun",      level:"advanced", tags:["succession-continuity"],              definition:"The state of lasting forever or for an indefinitely long time.",                example:"No single officer creates perpetuity — it comes from documented systems." },
  { id:"wb-a18", word:"Metamorphosis",  partOfSpeech:"noun",      level:"advanced", tags:["transformational-impact"],            definition:"A profound change in form or character.",                                     example:"The metamorphosis from nervous newcomer to confident speaker is the club's core product." },

  // ── standard additions ──────────────────────────────────────────────────────
  // vision
  { id:"wb-s19", word:"Aspiration",    partOfSpeech:"noun",      level:"standard", tags:["vision","personal-growth"],            definition:"A strong hope or ambition to achieve something meaningful.",                   example:"A speaker who names their aspiration early gives the audience a reason to listen." },
  { id:"wb-s20", word:"Perspective",   partOfSpeech:"noun",      level:"standard", tags:["vision","wisdom"],                     definition:"A particular way of thinking about and understanding something.",               example:"Perspective is what turns a complaint into a compelling story." },
  { id:"wb-s21", word:"Beacon",        partOfSpeech:"noun",      level:"standard", tags:["vision","leadership"],                  definition:"A source of inspiration or guidance in uncertain conditions.",                  example:"A great mentor is a beacon — they do not direct; they illuminate the path." },
  { id:"wb-s22", word:"Ambition",      partOfSpeech:"noun",      level:"standard", tags:["vision","personal-growth"],            definition:"A strong desire and determination to succeed at something.",                    example:"Ambition without a plan is just restlessness; ambition with a plan is momentum." },
  // courage
  { id:"wb-s23", word:"Resilience",    partOfSpeech:"noun",      level:"standard", tags:["courage","personal-growth"],           definition:"The capacity to recover quickly from setbacks or adversity.",                   example:"Resilience is what brings a speaker back to the lectern after a difficult meeting." },
  { id:"wb-s24", word:"Tenacity",      partOfSpeech:"noun",      level:"standard", tags:["courage","discipline"],                definition:"The quality of holding firm to a purpose in the face of obstacles.",            example:"Tenacity in a Pathways project means showing up even when the project feels hard." },
  { id:"wb-s25", word:"Grit",          partOfSpeech:"noun",      level:"standard", tags:["courage","discipline"],                definition:"Courage and resolve; strength of character under sustained effort.",            example:"Grit is not glamorous — it is the fourth rehearsal when the first three felt good enough." },
  { id:"wb-s26", word:"Conviction",    partOfSpeech:"noun",      level:"standard", tags:["courage","leadership"],                definition:"A firmly held belief that guides action.",                                     example:"Conviction in a speech is visible — the audience feels when a speaker truly means what they say." },
  // discipline
  { id:"wb-s27", word:"Rigor",         partOfSpeech:"noun",      level:"standard", tags:["discipline"],                         definition:"The quality of being extremely thorough, careful, and demanding of quality.",   example:"Rigor in preparation distinguishes a polished speaker from a prepared one." },
  { id:"wb-s28", word:"Consistency",   partOfSpeech:"noun",      level:"standard", tags:["discipline","leadership"],             definition:"The quality of achieving the same high standard across time and context.",      example:"Consistency in showing up is the most underrated form of leadership." },
  { id:"wb-s29", word:"Dedication",    partOfSpeech:"noun",      level:"standard", tags:["discipline","personal-growth"],        definition:"The quality of being committed to a task or purpose over time.",                example:"Dedication is not passion — it is practice on the days passion has not arrived yet." },
  { id:"wb-s30", word:"Habit",         partOfSpeech:"noun",      level:"standard", tags:["discipline"],                         definition:"A regular practice that becomes automatic through repetition.",                  example:"Speaking improvement is a habit, not an event — it compounds across many meetings." },
  // leadership
  { id:"wb-s31", word:"Empowerment",   partOfSpeech:"noun",      level:"standard", tags:["leadership","teamwork"],               definition:"The process of giving people the confidence and authority to act.",              example:"Empowerment means handing the agenda to a new member before they feel fully ready." },
  { id:"wb-s32", word:"Guidance",      partOfSpeech:"noun",      level:"standard", tags:["leadership"],                         definition:"Advice or direction aimed at helping others navigate decisions.",               example:"Guidance from a mentor can compress years of learning into a single conversation." },
  { id:"wb-s33", word:"Resolve",       partOfSpeech:"noun",      level:"standard", tags:["leadership","courage"],                definition:"Firm determination to do something even when it is difficult.",                 example:"Resolve is what separates a leader who decides from one who deliberates indefinitely." },
  { id:"wb-s34", word:"Accountability",partOfSpeech:"noun",      level:"standard", tags:["leadership","teamwork"],               definition:"The willingness to accept responsibility for one's actions and results.",        example:"Accountability builds trust faster than competence alone ever could." },
  // communication
  { id:"wb-s35", word:"Concision",     partOfSpeech:"noun",      level:"standard", tags:["communication","rhetoric"],            definition:"The quality of being clear and brief without unnecessary words.",               example:"Concision is not about saying less — it is about saying exactly enough." },
  { id:"wb-s36", word:"Rapport",       partOfSpeech:"noun",      level:"standard", tags:["communication","teamwork"],            definition:"A close, harmonious relationship built on mutual understanding.",                example:"Rapport with an audience is established in the first thirty seconds." },
  { id:"wb-s37", word:"Fluency",       partOfSpeech:"noun",      level:"standard", tags:["communication"],                      definition:"The ability to speak or write smoothly and with confident expression.",         example:"Fluency is not the absence of pauses — it is the confident use of them." },
  { id:"wb-s38", word:"Delivery",      partOfSpeech:"noun",      level:"standard", tags:["communication","executive-presence"],  definition:"The manner and style in which a speech or message is presented.",               example:"Delivery is the amplifier — great content at low delivery still loses the room." },
  // teamwork
  { id:"wb-s39", word:"Unity",         partOfSpeech:"noun",      level:"standard", tags:["teamwork","building-culture"],         definition:"The state of being joined together and working as one.",                       example:"Unity in a club is visible when members cheer for each other's milestones." },
  { id:"wb-s40", word:"Fellowship",    partOfSpeech:"noun",      level:"standard", tags:["teamwork","building-culture"],         definition:"A feeling of shared experience, purpose, and belonging within a group.",        example:"Fellowship is what makes a club more than a meeting." },
  { id:"wb-s41", word:"Alliance",      partOfSpeech:"noun",      level:"standard", tags:["teamwork","strategic-leadership"],     definition:"A cooperative relationship formed for a shared purpose or benefit.",            example:"A strong officer team operates less like a committee and more like an alliance." },
  { id:"wb-s42", word:"Partnership",   partOfSpeech:"noun",      level:"standard", tags:["teamwork"],                           definition:"A cooperative relationship where both parties contribute and benefit.",          example:"A speaker-evaluator partnership produces growth that neither could create alone." },
  // legacy
  { id:"wb-s43", word:"Tradition",     partOfSpeech:"noun",      level:"standard", tags:["legacy","building-culture"],          definition:"A long-established practice or custom that carries meaning across time.",       example:"A club tradition is only worth keeping if it serves the member, not the nostalgia." },
  { id:"wb-s44", word:"Foundation",    partOfSpeech:"noun",      level:"standard", tags:["legacy","leadership"],                definition:"The basis on which something is built and sustained.",                         example:"Every strong club culture has a foundation of high expectations applied with kindness." },
  { id:"wb-s45", word:"Cornerstone",   partOfSpeech:"noun",      level:"standard", tags:["legacy","strategic-vision"],          definition:"The most important element on which everything else is based.",                 example:"Consistent meeting quality is the cornerstone of long-term membership retention." },
  { id:"wb-s46", word:"Remembrance",   partOfSpeech:"noun",      level:"standard", tags:["legacy","storytelling"],              definition:"The act of keeping the memory of a person or event alive.",                    example:"A tribute speech is an act of remembrance — it makes the past present." },
  // innovation
  { id:"wb-s47", word:"Exploration",   partOfSpeech:"noun",      level:"standard", tags:["innovation","personal-growth"],       definition:"The thorough examination of an unfamiliar idea or approach.",                  example:"Exploration in Table Topics means treating every prompt as an invitation, not a test." },
  { id:"wb-s48", word:"Imagination",   partOfSpeech:"noun",      level:"standard", tags:["innovation","storytelling"],          definition:"The ability to form new ideas or images not directly experienced.",             example:"Imagination is what separates a speech that explains from one that transports." },
  { id:"wb-s49", word:"Curiosity",     partOfSpeech:"noun",      level:"standard", tags:["innovation","wisdom"],                definition:"A strong desire to know or learn something new.",                              example:"Curiosity is the most reliable predictor of growth in any speaker." },
  { id:"wb-s50", word:"Discovery",     partOfSpeech:"noun",      level:"standard", tags:["innovation"],                         definition:"The finding of something new through investigation or experience.",            example:"The best speeches do not just inform — they create a sense of discovery." },
  // wisdom
  { id:"wb-s51", word:"Reflection",    partOfSpeech:"noun",      level:"standard", tags:["wisdom","personal-growth"],           definition:"Careful, deliberate thought about one's experiences and choices.",              example:"Reflection after a meeting is where the real learning actually happens." },
  { id:"wb-s52", word:"Insight",       partOfSpeech:"noun",      level:"standard", tags:["wisdom","communication"],             definition:"The capacity to understand a situation clearly and accurately.",                example:"An evaluator's highest skill is not criticism — it is insight." },
  { id:"wb-s53", word:"Awareness",     partOfSpeech:"noun",      level:"standard", tags:["wisdom","communication"],             definition:"Knowledge and accurate perception of a situation or one's own tendencies.",     example:"Awareness of filler words is the first step to eliminating them." },
  { id:"wb-s54", word:"Experience",    partOfSpeech:"noun",      level:"standard", tags:["wisdom","legacy"],                    definition:"Practical contact with reality that produces learning over time.",              example:"Experience shared in a speech is more convincing than any statistic." },
  // storytelling
  { id:"wb-s55", word:"Imagery",       partOfSpeech:"noun",      level:"standard", tags:["storytelling","communication"],       definition:"Descriptive language that creates vivid pictures in the listener's mind.",      example:"Imagery turns a speech about struggle into something the audience can see and feel." },
  { id:"wb-s56", word:"Scene",         partOfSpeech:"noun",      level:"standard", tags:["storytelling"],                       definition:"A specific, concrete moment that grounds a story in time and place.",           example:"Opening with a scene instead of a thesis earns the audience's attention immediately." },
  { id:"wb-s57", word:"Voice",         partOfSpeech:"noun",      level:"standard", tags:["storytelling","communication"],       definition:"The distinctive perspective and style a speaker brings to their material.",     example:"Voice is what makes two speeches on the same topic feel completely different." },
  { id:"wb-s58", word:"Detail",        partOfSpeech:"noun",      level:"standard", tags:["storytelling"],                       definition:"A specific element that makes a story feel precise and real.",                  example:"Detail is the difference between 'a car' and 'a rusted 1987 Corolla with one working window.'" },
  // rhetoric
  { id:"wb-s59", word:"Emphasis",      partOfSpeech:"noun",      level:"standard", tags:["rhetoric","communication"],           definition:"Special importance or force given to a particular word or idea.",               example:"Emphasis through a deliberate pause is more powerful than volume." },
  { id:"wb-s60", word:"Cadence",       partOfSpeech:"noun",      level:"standard", tags:["rhetoric","storytelling"],            definition:"The rhythm and flow of language in spoken delivery.",                          example:"Cadence tells the audience when to lean in and when to absorb what was just said." },
  { id:"wb-s61", word:"Phrasing",      partOfSpeech:"noun",      level:"standard", tags:["rhetoric","communication"],           definition:"The way words are chosen and arranged to create a particular effect.",          example:"Strong phrasing means the sentence could not be improved by changing a single word." },
  { id:"wb-s62", word:"Tone",          partOfSpeech:"noun",      level:"standard", tags:["rhetoric","executive-presence"],      definition:"The attitude a speaker conveys through word choice, pace, and delivery.",       example:"Tone sets the emotional contract between speaker and audience before a word of content lands." },
  // executive presence
  { id:"wb-s63", word:"Bearing",       partOfSpeech:"noun",      level:"standard", tags:["executive-presence"],                 definition:"The manner in which a person holds and conducts themselves.",                  example:"Bearing communicates readiness before the first word is spoken." },
  { id:"wb-s64", word:"Grace",         partOfSpeech:"noun",      level:"standard", tags:["executive-presence","leadership"],    definition:"Smoothness and elegance of manner, especially under pressure.",                 example:"Handling a late speaker with grace signals that the Toastmaster controls the meeting, not the agenda." },
  { id:"wb-s65", word:"Command",       partOfSpeech:"noun",      level:"standard", tags:["executive-presence","leadership"],    definition:"The ability to hold attention and inspire confidence in a room.",               example:"Command is not volume — it is the settled certainty that what you are saying matters." },
  { id:"wb-s66", word:"Stature",       partOfSpeech:"noun",      level:"standard", tags:["executive-presence"],                 definition:"The level of respect and standing a person holds within a group.",             example:"Stature is earned through consistency, not position." },
  // strategic vision
  { id:"wb-s67", word:"Direction",     partOfSpeech:"noun",      level:"standard", tags:["strategic-vision","leadership"],      definition:"The path or course toward which effort and intention are aimed.",               example:"A club without a clear direction treats every meeting as equally important — and none as urgent." },
  { id:"wb-s68", word:"Objective",     partOfSpeech:"noun",      level:"standard", tags:["strategic-vision","planning-execution"], definition:"A specific, measurable goal toward which effort is directed.",               example:"An objective gives a team something to aim at together." },
  { id:"wb-s69", word:"Blueprint",     partOfSpeech:"noun",      level:"standard", tags:["strategic-vision","planning-execution"], definition:"A detailed plan or program showing how a goal will be achieved.",           example:"A blueprint for the program year aligns officer decisions before the first meeting." },
  { id:"wb-s70", word:"Roadmap",       partOfSpeech:"noun",      level:"standard", tags:["strategic-vision"],                   definition:"A plan showing how a goal will be reached stage by stage.",                    example:"A roadmap makes abstract ambition concrete and actionable." },
  // planning & execution
  { id:"wb-s71", word:"Logistics",     partOfSpeech:"noun",      level:"standard", tags:["planning-execution"],                 definition:"The detailed planning and coordination of an operation.",                     example:"Logistics is what prevents a great meeting concept from becoming a chaotic experience." },
  { id:"wb-s72", word:"Milestone",     partOfSpeech:"noun",      level:"standard", tags:["planning-execution"],                 definition:"A significant event marking measurable progress toward a goal.",               example:"Milestones make long-term goals feel achievable by showing incremental wins." },
  { id:"wb-s73", word:"Workflow",      partOfSpeech:"noun",      level:"standard", tags:["planning-execution","discipline"],    definition:"The sequence of steps used to complete a task reliably.",                     example:"A consistent workflow for agenda preparation protects meetings from last-minute chaos." },
  { id:"wb-s74", word:"Execution",     partOfSpeech:"noun",      level:"standard", tags:["planning-execution"],                 definition:"The effective carrying out of a plan or strategy.",                           example:"Vision without execution is just a meeting that never happened." },
  // navigating conflict
  { id:"wb-s75", word:"Empathy",       partOfSpeech:"noun",      level:"standard", tags:["navigating-conflict","communication"],definition:"The ability to understand and share the feelings of another person.",           example:"Empathy in an evaluation means acknowledging effort before offering critique." },
  { id:"wb-s76", word:"Bridge",        partOfSpeech:"noun",      level:"standard", tags:["navigating-conflict","teamwork"],     definition:"Something that connects opposing positions or perspectives.",                   example:"A skilled facilitator builds a bridge before asking both sides to cross it." },
  { id:"wb-s77", word:"Patience",      partOfSpeech:"noun",      level:"standard", tags:["navigating-conflict","discipline"],   definition:"The capacity to accept difficulty or delay without becoming frustrated.",       example:"Patience in a disagreement is often more persuasive than the argument itself." },
  { id:"wb-s78", word:"Resolution",    partOfSpeech:"noun",      level:"standard", tags:["navigating-conflict"],                definition:"The successful settlement of a disagreement or problem.",                      example:"Resolution does not require agreement — it requires a path both parties can accept." },
  // building culture
  { id:"wb-s79", word:"Belonging",     partOfSpeech:"noun",      level:"standard", tags:["building-culture","teamwork"],        definition:"The feeling of being accepted, valued, and included in a group.",              example:"Belonging is the reason some members attend even when they have nothing on the agenda." },
  { id:"wb-s80", word:"Inclusion",     partOfSpeech:"noun",      level:"standard", tags:["building-culture"],                   definition:"The deliberate practice of involving people of all backgrounds and abilities.", example:"Inclusion in a club means every member sees a path to every role." },
  { id:"wb-s81", word:"Norms",         partOfSpeech:"noun",      level:"standard", tags:["building-culture"],                   definition:"The unwritten standards of behavior expected within a group.",                  example:"Norms, not rules, are what actually govern how a club treats its members." },
  { id:"wb-s82", word:"Values",        partOfSpeech:"noun",      level:"standard", tags:["building-culture","leadership"],      definition:"The principles that guide what a person or group considers important.",         example:"Values displayed in behavior carry more weight than values listed in a mission statement." },
  // succession & continuity
  { id:"wb-s83", word:"Transfer",      partOfSpeech:"noun",      level:"standard", tags:["succession-continuity"],              definition:"The act of moving knowledge, authority, or responsibility to another person.",  example:"A clean transfer of officer duties is the final act of a successful term." },
  { id:"wb-s84", word:"Renewal",       partOfSpeech:"noun",      level:"standard", tags:["succession-continuity","transformational-impact"], definition:"The restoration of something to a fresh and strengthened state.",  example:"Renewal in a club comes from new members who challenge old assumptions." },
  { id:"wb-s85", word:"Preservation",  partOfSpeech:"noun",      level:"standard", tags:["succession-continuity","legacy"],     definition:"The action of keeping something valuable safe from loss or decay.",            example:"Preservation of institutional knowledge requires documentation, not just memory." },
  { id:"wb-s86", word:"Succession",    partOfSpeech:"noun",      level:"standard", tags:["succession-continuity"],              definition:"The orderly process of one person taking over a role from another.",           example:"A succession plan is a gift to the next officer — and to the members who will follow." },
  // transformational impact
  { id:"wb-s87", word:"Progress",      partOfSpeech:"noun",      level:"standard", tags:["transformational-impact","personal-growth"], definition:"Forward movement toward a better or more complete state.",              example:"Progress in speaking is not always visible to the speaker — which is why evaluators matter." },
  { id:"wb-s88", word:"Evolution",     partOfSpeech:"noun",      level:"standard", tags:["transformational-impact"],            definition:"Gradual development toward a more complex or improved form.",                  example:"A club's evolution from struggling to thriving rarely happens in a single meeting." },
  { id:"wb-s89", word:"Catalyst",      partOfSpeech:"noun",      level:"standard", tags:["transformational-impact","leadership"],definition:"A person or event that causes or accelerates significant change.",           example:"A great VPE is a catalyst — they do not do the work; they make the work possible." },
  { id:"wb-s90", word:"Propulsion",    partOfSpeech:"noun",      level:"standard", tags:["transformational-impact","strategic-leadership"], definition:"A force that drives something forward with sustained energy.", example:"Shared goals provide propulsion that individual motivation cannot sustain alone." },
  // cross-arc standard words
  { id:"wb-s91", word:"Commitment",    partOfSpeech:"noun",      level:"standard", tags:["personal-growth","discipline","leadership"], definition:"Dedication to a course of action regardless of difficulty.", example:"Commitment to the agenda is what separates an officer from a volunteer." },
  { id:"wb-s92", word:"Mentorship",    partOfSpeech:"noun",      level:"standard", tags:["legacy","leadership","succession-continuity"], definition:"Guidance and support given by a more experienced person to a less experienced one.", example:"Mentorship multiplies impact — the mentor grows as much as the mentee." },
  { id:"wb-s93", word:"Excellence",    partOfSpeech:"noun",      level:"standard", tags:["discipline","executive-presence","building-culture"], definition:"The quality of being outstanding in a sustained and deliberate way.", example:"Excellence is not an event — it is what happens when standards are held consistently." },
  { id:"wb-s94", word:"Authenticity",  partOfSpeech:"noun",      level:"standard", tags:["storytelling","leadership","communication"], definition:"The quality of being genuine, true to oneself, and transparent.", example:"Authenticity in a speech cannot be coached — it can only be permitted." },
  { id:"wb-s95", word:"Momentum",      partOfSpeech:"noun",      level:"standard", tags:["transformational-impact","strategic-leadership","planning-execution"], definition:"The energy and drive that builds from sustained forward movement.", example:"Momentum in a club program year is fragile — missed meetings break it faster than poor speeches." },
  { id:"wb-s96", word:"Transparency",  partOfSpeech:"noun",      level:"standard", tags:["leadership","building-culture","communication"], definition:"Openness about decisions, intentions, and reasoning.", example:"Transparency from an officer builds trust even when the news is not good." },
  { id:"wb-s97", word:"Integrity",     partOfSpeech:"noun",      level:"standard", tags:["leadership","legacy","navigating-conflict"], definition:"Adherence to moral and ethical principles in all conditions.", example:"Integrity means the decision is the same whether or not anyone is watching." },
  { id:"wb-s98", word:"Adaptability",  partOfSpeech:"noun",      level:"standard", tags:["innovation","planning-execution","navigating-conflict"], definition:"The quality of adjusting effectively to new conditions or challenges.", example:"Adaptability in a Toastmaster means every disruption becomes an opportunity." },
  { id:"wb-s99", word:"Curiosity",     partOfSpeech:"noun",      level:"standard", tags:["innovation","wisdom","personal-growth"], definition:"A strong desire to explore, question, and understand.", example:"Curiosity about the audience is the beginning of every great speech." },
  { id:"wb-s100",word:"Generosity",    partOfSpeech:"noun",      level:"standard", tags:["teamwork","legacy","building-culture"], definition:"Willingness to give time, energy, or knowledge freely for others' benefit.", example:"Generosity with feedback — specific, honest, and warm — is a club's highest offering." },

  // ── advanced additions ──────────────────────────────────────────────────────
  // vision
  { id:"wb-a19", word:"Prognostication",partOfSpeech:"noun",     level:"advanced", tags:["vision"],                             definition:"The action of predicting a future event or condition.",                       example:"Prognostication without data is guesswork; with it, it becomes leadership." },
  { id:"wb-a20", word:"Clairvoyance",   partOfSpeech:"noun",     level:"advanced", tags:["vision"],                             definition:"The supposed power of perceiving future events; unusually sharp insight.",     example:"What looks like clairvoyance in a leader is usually disciplined pattern recognition." },
  { id:"wb-a21", word:"Omniscience",    partOfSpeech:"noun",     level:"advanced", tags:["vision","strategic-vision"],          definition:"Complete or unlimited knowledge; total awareness of a situation.",             example:"No leader has omniscience — the best ones build teams to compensate for what they cannot see." },
  { id:"wb-a22", word:"Anticipatory",   partOfSpeech:"adjective",level:"advanced", tags:["vision","planning-execution"],        definition:"Occurring or existing in anticipation of events before they arrive.",           example:"An anticipatory meeting design solves problems before members experience them." },
  // courage
  { id:"wb-a23", word:"Intrepidity",    partOfSpeech:"noun",     level:"advanced", tags:["courage"],                            definition:"Fearless and resolute courage in the face of difficulty.",                    example:"Intrepidity in a speaker is not the absence of nerves — it is the decision to speak anyway." },
  { id:"wb-a24", word:"Dauntlessness",  partOfSpeech:"noun",     level:"advanced", tags:["courage"],                            definition:"Fearless determination that cannot be discouraged or intimidated.",            example:"Dauntlessness is visible in a speaker who recovers from a lost place in their notes and carries on." },
  { id:"wb-a25", word:"Audacity",       partOfSpeech:"noun",     level:"advanced", tags:["courage","innovation"],               definition:"A willingness to take bold risks that surprise or challenge convention.",       example:"Audacity in a club format can reinvigorate a meeting pattern that has grown stale." },
  { id:"wb-a26", word:"Forthrightness", partOfSpeech:"noun",     level:"advanced", tags:["courage","communication"],            definition:"The quality of being direct, open, and honest without hesitation.",             example:"Forthrightness in feedback builds trust faster than diplomatic vagueness ever does." },
  // discipline
  { id:"wb-a27", word:"Perseverance",   partOfSpeech:"noun",     level:"advanced", tags:["discipline","personal-growth"],       definition:"Continued effort toward a goal despite difficulty, delay, or discouragement.",  example:"Perseverance in Pathways is measured in projects completed, not meetings attended." },
  { id:"wb-a28", word:"Exacting",       partOfSpeech:"adjective",level:"advanced", tags:["discipline"],                         definition:"Demanding a high level of precision, attention, and effort.",                  example:"An exacting standard for meeting quality raises the bar for every role." },
  { id:"wb-a29", word:"Conscientiousness",partOfSpeech:"noun",   level:"advanced", tags:["discipline","leadership"],            definition:"The quality of working carefully and thoroughly to meet a high standard.",      example:"Conscientiousness in an officer shows in the details members never think to notice." },
  { id:"wb-a30", word:"Rigorousness",   partOfSpeech:"noun",     level:"advanced", tags:["discipline"],                         definition:"The state of being strictly demanding in quality and thoroughness.",            example:"Rigorousness in evaluation means not softening feedback that the speaker needs to hear." },
  // leadership
  { id:"wb-a31", word:"Magnanimity",    partOfSpeech:"noun",     level:"advanced", tags:["leadership","legacy"],                definition:"The noble quality of being generous, forgiving, and above petty concerns.",    example:"Magnanimity after a disagreement restores a team faster than winning the argument." },
  { id:"wb-a32", word:"Eminence",       partOfSpeech:"noun",     level:"advanced", tags:["leadership","executive-presence"],    definition:"The quality of being prominently respected and distinguished in a role.",       example:"Eminence is earned in a club through consistent service, not through title." },
  { id:"wb-a33", word:"Probity",        partOfSpeech:"noun",     level:"advanced", tags:["leadership"],                         definition:"The quality of having strong moral principles and total honesty.",              example:"Probity as a leader means your words and your actions are the same document." },
  { id:"wb-a34", word:"Sovereignty",    partOfSpeech:"noun",     level:"advanced", tags:["leadership","executive-presence"],    definition:"Supreme authority and self-governance; command without dependence.",            example:"A Toastmaster who has sovereignty over their nerves has sovereignty over the room." },
  // communication
  { id:"wb-a35", word:"Mellifluous",    partOfSpeech:"adjective",level:"advanced", tags:["communication","executive-presence"], definition:"Having a pleasingly smooth and rich quality of sound.",                        example:"A mellifluous speaking voice makes even complex content feel accessible." },
  { id:"wb-a36", word:"Pellucid",       partOfSpeech:"adjective",level:"advanced", tags:["communication","rhetoric"],           definition:"Transparently clear in expression; easy to understand.",                       example:"Pellucid reasoning means the audience follows the argument without effort." },
  { id:"wb-a37", word:"Elocution",      partOfSpeech:"noun",     level:"advanced", tags:["communication","rhetoric"],           definition:"The skill of clear, expressive, and effective public speech.",                  example:"Elocution training does not create speakers — it reveals the speaker already present." },
  { id:"wb-a38", word:"Euphonious",     partOfSpeech:"adjective",level:"advanced", tags:["communication","storytelling"],       definition:"Pleasing to the ear; having a smooth and harmonious sound.",                   example:"Euphonious word choices make a speech feel as good to hear as it is to understand." },
  // teamwork
  { id:"wb-a39", word:"Symbiosis",      partOfSpeech:"noun",     level:"advanced", tags:["teamwork"],                           definition:"A mutually beneficial relationship where both parties grow through cooperation.", example:"A speaker and evaluator in symbiosis produce growth neither could achieve independently." },
  { id:"wb-a40", word:"Unanimity",      partOfSpeech:"noun",     level:"advanced", tags:["teamwork","navigating-conflict"],     definition:"Complete agreement among all members of a group.",                            example:"Unanimity is not required for action — but it is worth pursuing before a difficult decision." },
  { id:"wb-a41", word:"Concord",        partOfSpeech:"noun",     level:"advanced", tags:["teamwork","building-culture"],        definition:"A state of agreement and harmony between people or groups.",                   example:"Concord among officers produces the kind of meeting that members experience as effortless." },
  { id:"wb-a42", word:"Collegial",      partOfSpeech:"adjective",level:"advanced", tags:["teamwork","building-culture"],        definition:"Relating to a relationship of shared responsibility and mutual respect among peers.", example:"A collegial officer team makes decisions together rather than within silos." },
  // legacy
  { id:"wb-a43", word:"Provenance",     partOfSpeech:"noun",     level:"advanced", tags:["legacy","succession-continuity"],     definition:"The origin and history of something; where it came from and how it developed.", example:"A club with clear provenance knows what made it strong — and can protect it." },
  { id:"wb-a44", word:"Perpetuation",   partOfSpeech:"noun",     level:"advanced", tags:["legacy","succession-continuity"],     definition:"The action of causing something valuable to continue indefinitely.",            example:"A mentor practices perpetuation — their influence outlives their active tenure." },
  { id:"wb-a45", word:"Enshrinement",   partOfSpeech:"noun",     level:"advanced", tags:["legacy","building-culture"],         definition:"The act of preserving something as enduring, respected, and beyond casual revision.", example:"Enshrinement of club standards protects quality even when leadership changes." },
  { id:"wb-a46", word:"Bequest",        partOfSpeech:"noun",     level:"advanced", tags:["legacy","succession-continuity"],     definition:"Something handed down or left to those who come after.",                       example:"A well-documented program year is a bequest — it gives the next VPE a running start." },
  // innovation
  { id:"wb-a47", word:"Heuristic",      partOfSpeech:"noun",     level:"advanced", tags:["innovation","wisdom"],               definition:"A practical problem-solving approach based on discovery and learning-by-doing.", example:"A heuristic for agenda design improves over time because each meeting teaches something." },
  { id:"wb-a48", word:"Protean",        partOfSpeech:"adjective",level:"advanced", tags:["innovation","adaptability"],         definition:"Tending to take on many forms; versatile and constantly evolving.",             example:"The best VPEs are protean — they adapt the same principles to completely different clubs." },
  { id:"wb-a49", word:"Seminal",        partOfSpeech:"adjective",level:"advanced", tags:["innovation","legacy"],               definition:"Strongly influencing later developments; original and foundational.",            example:"A seminal speech at a club anniversary can define the culture for years." },
  { id:"wb-a50", word:"Iconoclast",     partOfSpeech:"noun",     level:"advanced", tags:["innovation","courage"],              definition:"A person who challenges established conventions and finds new ways forward.",     example:"Every great club reform began with an iconoclast willing to ask why." },
  // wisdom
  { id:"wb-a51", word:"Erudition",      partOfSpeech:"noun",     level:"advanced", tags:["wisdom"],                            definition:"The quality of having extensive knowledge gained through deep study.",          example:"Erudition in a speaker earns credibility — if it is worn lightly enough to remain approachable." },
  { id:"wb-a52", word:"Perspicuity",    partOfSpeech:"noun",     level:"advanced", tags:["wisdom","communication"],            definition:"The quality of being clearly expressed and easily understood.",                example:"Perspicuity is the goal behind every revision — fewer words, clearer meaning." },
  { id:"wb-a53", word:"Sagaciousness",  partOfSpeech:"noun",     level:"advanced", tags:["wisdom"],                            definition:"The quality of having good judgment and practical wisdom.",                    example:"Sagaciousness in an evaluator means knowing which truth the speaker most needs to hear." },
  { id:"wb-a54", word:"Sapience",       partOfSpeech:"noun",     level:"advanced", tags:["wisdom","leadership"],               definition:"Deep wisdom and sound judgment developed through experience and reflection.",   example:"Sapience is wisdom in action — not knowledge held, but judgment applied." },
  // storytelling
  { id:"wb-a55", word:"Allegory",       partOfSpeech:"noun",     level:"advanced", tags:["storytelling","rhetoric"],           definition:"A story where characters or events represent abstract ideas or moral principles.", example:"A well-crafted allegory makes an abstract principle concrete enough to feel." },
  { id:"wb-a56", word:"Epiphany",       partOfSpeech:"noun",     level:"advanced", tags:["storytelling","personal-growth"],    definition:"A sudden, profound realization or moment of insight that changes perspective.",   example:"A speech built around an epiphany gives the audience permission to be changed." },
  { id:"wb-a57", word:"Hyperbole",      partOfSpeech:"noun",     level:"advanced", tags:["storytelling","rhetoric"],           definition:"Deliberate exaggeration used for effect rather than literal truth.",             example:"Hyperbole works in comedy and contrast — but only if the audience knows you know you are doing it." },
  { id:"wb-a58", word:"Parable",        partOfSpeech:"noun",     level:"advanced", tags:["storytelling"],                      definition:"A short story illustrating a moral or spiritual lesson through simple events.",  example:"A parable lands differently than a lecture — because it earns its conclusion." },
  // rhetoric
  { id:"wb-a59", word:"Chiasmus",       partOfSpeech:"noun",     level:"advanced", tags:["rhetoric"],                          definition:"A figure of speech where words or ideas are repeated in reverse grammatical order.", example:"'Ask not what your country can do for you' — chiasmus used to perfection." },
  { id:"wb-a60", word:"Epistrophe",     partOfSpeech:"noun",     level:"advanced", tags:["rhetoric"],                          definition:"The repetition of a word or phrase at the end of successive clauses.",           example:"Epistrophe drives home a theme: 'We will learn, we will grow, we will lead.'" },
  { id:"wb-a61", word:"Kairos",         partOfSpeech:"noun",     level:"advanced", tags:["rhetoric","strategic-leadership"],   definition:"The opportune moment; the right time to make a decisive point.",               example:"A speaker who has kairos knows when the audience is ready to receive the message." },
  { id:"wb-a62", word:"Parallelism",    partOfSpeech:"noun",     level:"advanced", tags:["rhetoric","communication"],          definition:"The use of matching grammatical structures to create rhythm and clarity.",       example:"Parallelism — 'prepare, practice, perform' — makes a list feel like a commitment." },
  // executive presence
  { id:"wb-a63", word:"Elan",           partOfSpeech:"noun",     level:"advanced", tags:["executive-presence"],                definition:"Energy, style, and enthusiasm that makes a person compelling to watch.",        example:"Elan is not performance — it is the overflow of genuine engagement with the material." },
  { id:"wb-a64", word:"Finesse",        partOfSpeech:"noun",     level:"advanced", tags:["executive-presence","navigating-conflict"], definition:"Skillful handling of a situation with subtlety and delicacy.",            example:"Finesse in delivering difficult feedback leaves the speaker grateful, not defensive." },
  { id:"wb-a65", word:"Savoir-faire",   partOfSpeech:"noun",     level:"advanced", tags:["executive-presence"],                definition:"The instinctive ability to behave appropriately in any situation.",             example:"Savoir-faire is what allows a leader to be equally at ease opening a meeting and closing a crisis." },
  { id:"wb-a66", word:"Equanimity",     partOfSpeech:"noun",     level:"advanced", tags:["executive-presence","navigating-conflict"], definition:"Mental calmness and composure, especially in difficult situations.",       example:"Equanimity under pressure is the single most credible signal of senior leadership." },
  // strategic vision
  { id:"wb-a67", word:"Holistic",       partOfSpeech:"adjective",level:"advanced", tags:["strategic-vision"],                  definition:"Characterized by consideration of the whole rather than isolated parts.",      example:"Holistic club development means no role is treated as unimportant." },
  { id:"wb-a68", word:"Synoptic",       partOfSpeech:"adjective",level:"advanced", tags:["strategic-vision"],                  definition:"Relating to a comprehensive overview that reveals the full picture.",           example:"A synoptic view of the program year identifies the moments that matter most." },
  { id:"wb-a69", word:"Panoramic",      partOfSpeech:"adjective",level:"advanced", tags:["strategic-vision","vision"],         definition:"Covering a wide range of subjects, perspectives, or possibilities.",            example:"A panoramic leadership style sees member development, club health, and community impact as one." },
  { id:"wb-a70", word:"Transcendent",   partOfSpeech:"adjective",level:"advanced", tags:["strategic-vision","transformational-impact"], definition:"Going beyond ordinary experience or expectation; surpassing usual limits.", example:"A transcendent speech changes the way its audience sees something they thought they already understood." },
  // planning & execution
  { id:"wb-a71", word:"Systematize",    partOfSpeech:"verb",     level:"advanced", tags:["planning-execution"],                definition:"To arrange things according to a deliberate, organized system.",               example:"A VPE who can systematize member onboarding protects the club from institutional forgetting." },
  { id:"wb-a72", word:"Methodical",     partOfSpeech:"adjective",level:"advanced", tags:["planning-execution","discipline"],   definition:"Done with careful planning, structure, and attention to sequence.",            example:"A methodical approach to role assignments prevents the chaos of last-minute changes." },
  { id:"wb-a73", word:"Operability",    partOfSpeech:"noun",     level:"advanced", tags:["planning-execution"],                definition:"The quality of being ready and able to function effectively under real conditions.", example:"A meeting plan has operability only if it works when the speaker cancels at the last minute." },
  { id:"wb-a74", word:"Contingency",    partOfSpeech:"noun",     level:"advanced", tags:["planning-execution","navigating-conflict"], definition:"A provision made for a possible future event or condition.",             example:"Every strong meeting plan includes a contingency for the roles that fall through." },
  // navigating conflict
  { id:"wb-a75", word:"Detente",        partOfSpeech:"noun",     level:"advanced", tags:["navigating-conflict"],               definition:"The easing of strained relations between parties through mutual accommodation.", example:"A skilled facilitator creates detente before the harder conversation begins." },
  { id:"wb-a76", word:"Rapprochement",  partOfSpeech:"noun",     level:"advanced", tags:["navigating-conflict"],               definition:"The re-establishment of harmonious relations after a disagreement.",            example:"Rapprochement after a club dispute is harder than the original conflict — and more important." },
  { id:"wb-a77", word:"Adjudication",   partOfSpeech:"noun",     level:"advanced", tags:["navigating-conflict"],               definition:"The formal process of reaching a judgment or decision on a disputed matter.",   example:"Adjudication works only when both parties agree in advance to accept the outcome." },
  { id:"wb-a78", word:"Conciliation",   partOfSpeech:"noun",     level:"advanced", tags:["navigating-conflict"],               definition:"The act of ending disagreement and restoring goodwill between parties.",        example:"Conciliation is not about who is right — it is about what preserves the relationship." },
  // building culture
  { id:"wb-a79", word:"Cohesiveness",   partOfSpeech:"noun",     level:"advanced", tags:["building-culture","teamwork"],        definition:"The quality of forming a united, consistent, and effective whole.",             example:"Cohesiveness in a club is tested by how it handles a difficult meeting — not a great one." },
  { id:"wb-a80", word:"Mores",          partOfSpeech:"noun",     level:"advanced", tags:["building-culture"],                   definition:"The essential values, customs, and moral attitudes shared within a community.", example:"Mores govern behavior that no rulebook ever captures." },
  { id:"wb-a81", word:"Praxis",         partOfSpeech:"noun",     level:"advanced", tags:["building-culture","leadership"],      definition:"The practice and application of theory; belief translated into habitual action.", example:"A club's praxis is what its values look like in the way members treat a nervous first-timer." },
  { id:"wb-a82", word:"Zeitgeist",      partOfSpeech:"noun",     level:"advanced", tags:["building-culture","transformational-impact"], definition:"The defining spirit, mood, or outlook characteristic of a particular group or period.", example:"A club that reads its zeitgeist accurately designs meetings members actually want to attend." },
  // succession & continuity
  { id:"wb-a83", word:"Continuance",    partOfSpeech:"noun",     level:"advanced", tags:["succession-continuity"],              definition:"The state of remaining in effective existence or uninterrupted operation.",     example:"Continuance of club standards across officer terms requires documentation, not just culture." },
  { id:"wb-a84", word:"Genealogy",      partOfSpeech:"noun",     level:"advanced", tags:["succession-continuity","legacy"],     definition:"The study of origins, lineage, and development across time.",                  example:"Every club has a genealogy — the line of mentors and officers who shaped what it became." },
  { id:"wb-a85", word:"Custodianship",  partOfSpeech:"noun",     level:"advanced", tags:["succession-continuity"],              definition:"The role of protecting, maintaining, and improving something for future benefit.", example:"Custodianship of club culture means resisting the slow erosion of standards." },
  { id:"wb-a86", word:"Posterity",      partOfSpeech:"noun",     level:"advanced", tags:["succession-continuity","legacy"],     definition:"All future generations who will receive and build upon what is created today.",    example:"A club that documents its program year plants seeds for posterity." },
  // transformational impact
  { id:"wb-a87", word:"Catalysis",      partOfSpeech:"noun",     level:"advanced", tags:["transformational-impact"],            definition:"The process of accelerating change through an enabling or triggering force.",   example:"Catalysis happens when a single honest evaluation becomes the turning point in a speaker's journey." },
  { id:"wb-a88", word:"Epochal",        partOfSpeech:"adjective",level:"advanced", tags:["transformational-impact","legacy"],   definition:"Forming or marking a major turning point in development or history.",            example:"An epochal moment in a speaker's journey rarely feels epochal while it is happening." },
  { id:"wb-a89", word:"Paradigmatic",   partOfSpeech:"adjective",level:"advanced", tags:["transformational-impact","strategic-vision"], definition:"Representing a defining pattern or model for how things should be done.",    example:"A paradigmatic club builds a model that other clubs want to follow." },
  { id:"wb-a90", word:"Apotheosis",     partOfSpeech:"noun",     level:"advanced", tags:["transformational-impact","legacy"],   definition:"The highest point of development; the elevation of something to its fullest expression.", example:"The apotheosis of a speaker's journey is not a trophy — it is the moment they stop thinking about themselves." },
  // cross-arc advanced words
  { id:"wb-a91", word:"Circumspection", partOfSpeech:"noun",     level:"advanced", tags:["wisdom","leadership","navigating-conflict"], definition:"Careful consideration of all circumstances before acting or speaking.", example:"Circumspection before a difficult evaluation is not hesitation — it is respect." },
  { id:"wb-a92", word:"Loquaciousness", partOfSpeech:"noun",     level:"advanced", tags:["communication","storytelling"],      definition:"The quality of talking at length with skill and wit.",                          example:"Loquaciousness in a Toastmaster works only when every word earns its place." },
  { id:"wb-a93", word:"Imperviousness", partOfSpeech:"noun",     level:"advanced", tags:["courage","executive-presence"],      definition:"The quality of remaining unaffected by negative reactions or pressure.",        example:"Imperviousness to heckling is a skill — a speaker who keeps their thread is hard to rattle." },
  { id:"wb-a94", word:"Discernment",    partOfSpeech:"noun",     level:"advanced", tags:["wisdom","leadership"],               definition:"The ability to judge well; perception of what is excellent, true, or appropriate.", example:"Discernment tells an evaluator what to say, and when to stop." },
  { id:"wb-a95", word:"Dialectical",    partOfSpeech:"adjective",level:"advanced", tags:["navigating-conflict","rhetoric"],    definition:"Relating to the discovery of truth through reasoned argument and opposing views.", example:"A dialectical meeting format welcomes productive disagreement as a design feature." },
  { id:"wb-a96", word:"Extemporaneous", partOfSpeech:"adjective",level:"advanced", tags:["storytelling","courage","communication"], definition:"Spoken without prior preparation; improvised yet articulate.",                example:"An extemporaneous answer that is clear and honest beats a prepared one that feels canned." },
  { id:"wb-a97", word:"Luminosity",     partOfSpeech:"noun",     level:"advanced", tags:["executive-presence","storytelling"], definition:"The quality of radiating clarity, energy, and compelling presence.",            example:"A speaker with luminosity makes the audience forget they are watching a performance." },
  { id:"wb-a98", word:"Ineffable",      partOfSpeech:"adjective",level:"advanced", tags:["storytelling","wisdom"],            definition:"Too great or extreme to be expressed in words — which is why we try anyway.",    example:"The ineffable experience is the speaker's real subject; the words are just the path toward it." },
  { id:"wb-a99", word:"Gravitas",       partOfSpeech:"noun",     level:"advanced", tags:["executive-presence","leadership"],   definition:"A serious and dignified quality that commands respect and attention.",            example:"Gravitas in a young leader is earned through listening more than speaking." },
  { id:"wb-a100",word:"Virtuosity",     partOfSpeech:"noun",     level:"advanced", tags:["communication","executive-presence","storytelling"], definition:"Great technical skill in any pursuit, combined with the artistry to make it look natural.", example:"Virtuosity in speaking means the craft is invisible — only the story remains." },
];

function selectWordFromBank(base, level, usedIds, bank) {
  const slug = (s) => (s || "").toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
  const monthlySlug = slug(base.monthlyTheme);
  const arcSlug = slug(base.arc);
  const match = (w) => !usedIds.has(w.id) && w.level === level &&
    (w.tags.includes(monthlySlug) || w.tags.includes(arcSlug));
  const fallback = (w) => !usedIds.has(w.id) && w.level === level;
  const chosen = bank.find(match) || bank.find(fallback) || bank.find(w => w.level === level);
  if (chosen) usedIds.add(chosen.id);
  return chosen || null;
}

function buildThemePackageFromBank(base, level, usedIds, bank) {
  const std = selectWordFromBank(base, "standard", usedIds, bank);
  const adv = selectWordFromBank(base, "advanced", usedIds, bank);
  const primary = level === "advanced" ? adv : std;
  const secondary = level === "advanced" ? std : adv;
  return {
    ...base,
    wordOfDay:    primary?.word    || base.word,
    advancedWord: secondary?.word  || base.advanced,
    partOfSpeech: primary?.partOfSpeech || base.partOfSpeech,
    definition:   primary?.definition   || base.definition,
    example:      primary?.example      || base.example,
    difficulty:   level === "mixed" ? "Mixed" : level === "advanced" ? "Advanced" : "Professional",
    wordBankIds:  [std?.id, adv?.id].filter(Boolean),
  };
}

// ─── new member onboarding ─────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { step:1, weekMin:0,  weekMax:3,  roleKey:"Speaker 1",         label:"Icebreaker Speech"  },
  { step:2, weekMin:3,  weekMax:7,  roleKey:"Timer",              label:"Timer"              },
  { step:3, weekMin:7,  weekMax:11, roleKey:"Ah-Counter",         label:"Ah-Counter"         },
  { step:4, weekMin:11, weekMax:15, roleKey:"Grammarian",         label:"Grammarian"         },
  { step:5, weekMin:15, weekMax:22, roleKey:"Table Topicsmaster", label:"Table Topicsmaster" },
  { step:6, weekMin:22, weekMax:30, roleKey:"Evaluator 1",        label:"Primary Evaluator"  },
  { step:7, weekMin:30, weekMax:40, roleKey:"General Evaluator",  label:"General Evaluator"  },
];

function parseNewMembers(text) {
  return text.split("\n").map(line => {
    const [name, date] = line.split("|").map(s => s.trim());
    if (!name) return null;
    const joinDate = date && !isNaN(new Date(date + "T12:00:00")) ? date : new Date().toISOString().split("T")[0];
    return { name, joinDate };
  }).filter(Boolean);
}

function getOnboardingStep(joinDate, meetingDate) {
  const join = new Date(joinDate + "T12:00:00");
  const meet = meetingDate instanceof Date ? meetingDate : new Date(meetingDate + "T12:00:00");
  const weeks = (meet - join) / (7 * 24 * 3600 * 1000);
  if (weeks < 0) return null;
  return ONBOARDING_STEPS.find(s => weeks >= s.weekMin && weeks < s.weekMax) || null;
}

function lockedMeetingCount(lockedWeeks, cadence) {
  const rate = { weekly:1, firstThird:0.5, secondFourth:0.5, biweekly:0.5, monthly:0.25 }[cadence] || 1;
  return Math.max(1, Math.round(lockedWeeks * rate));
}

// ─── scheduling ────────────────────────────────────────────────────────────────

function ordinalWeekOfMonth(date) { return Math.ceil(date.getDate() / 7); }

function getNextDates(startDate, count, weekday, cadence) {
  const dates = [];
  const d = new Date(startDate + "T12:00:00");
  let seen = 0;
  while (dates.length < count) {
    if (d.getDay() === weekday) {
      const w = ordinalWeekOfMonth(d);
      let ok = false;
      if (cadence === "weekly") ok = true;
      if (cadence === "firstThird") ok = w === 1 || w === 3;
      if (cadence === "secondFourth") ok = w === 2 || w === 4;
      if (cadence === "biweekly") ok = seen % 2 === 0;
      if (cadence === "monthly") ok = w === 1;
      if (ok) dates.push(new Date(d));
      seen++;
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric", year:"numeric" });
}

function cadenceLabel(c) {
  return { weekly:"Weekly", firstThird:"1st & 3rd week", secondFourth:"2nd & 4th week", biweekly:"Biweekly", monthly:"Monthly" }[c] || "Weekly";
}
function difficultyLabel(l) { return { standard:"Professional", advanced:"Advanced" }[l] || "Mixed"; }
function formatPatternLabel(p) { return agendaPatternOptions[p] || "Standard"; }

function horizonToCount(horizon, cadence) {
  const weekRate = { weekly:1, firstThird:0.5, secondFourth:0.5, biweekly:0.5, monthly:0.25 }[cadence] || 1;
  const weeks = { "3wk":3, "5wk":5 }[horizon];
  if (weeks != null) return Math.max(1, Math.round(weeks * weekRate));
  const months = { "3mo":3, "6mo":6, "12mo":12, "36mo":36, "72mo":72 }[horizon];
  if (!months) return null;
  const monthRate = { weekly:4.33, firstThird:2, secondFourth:2, biweekly:2, monthly:1 }[cadence] || 4.33;
  return Math.round(months * monthRate);
}

function buildThemePackage(base, level) {
  if (level === "standard") return { ...base, wordOfDay:base.word, advancedWord:base.advanced, difficulty:"Professional" };
  if (level === "advanced") return { ...base, wordOfDay:base.advanced, advancedWord:base.word, difficulty:"Advanced" };
  return { ...base, wordOfDay:base.word, advancedWord:base.advanced, difficulty:"Mixed" };
}

function getAgendaTemplate(pattern, week, index) {
  if (pattern === "threeOneOne") { if (week===5) return agendaTemplates.specialShowcase; if (week===4) return agendaTemplates.workshop; return agendaTemplates.standard; }
  if (pattern === "hybrid") { if (week===5) return agendaTemplates.specialShowcase; if (week===2||week===4) return agendaTemplates.workshop; return agendaTemplates.standard; }
  const d = { standardOnly:agendaTemplates.standard, workshopOnly:agendaTemplates.workshop, speechMarathon:agendaTemplates.speechMarathon, tableTopicsIntensive:agendaTemplates.tableTopicsIntensive, openHouse:agendaTemplates.openHouse, contestPrep:agendaTemplates.contestPrep, evaluationClinic:agendaTemplates.evaluationClinic, clubSuccessPlanning:agendaTemplates.clubSuccessPlanning, specialShowcase:agendaTemplates.specialShowcase };
  if (d[pattern]) return d[pattern];
  const cycles = { growthCycle:[agendaTemplates.standard,agendaTemplates.workshop,agendaTemplates.tableTopicsIntensive,agendaTemplates.openHouse], educationCycle:[agendaTemplates.standard,agendaTemplates.speechMarathon,agendaTemplates.evaluationClinic,agendaTemplates.workshop], membershipCycle:[agendaTemplates.standard,agendaTemplates.openHouse,agendaTemplates.tableTopicsIntensive,agendaTemplates.specialShowcase] };
  if (cycles[pattern]) return cycles[pattern][index % cycles[pattern].length];
  return agendaTemplates.standard;
}

function assignRole(role, members, officers, mi, ri, mode) {
  const sm = members.length > 0 ? members : ["Open"];
  const so = officers.length > 0 ? officers : ["Officer / Open"];
  const mp = sm[(mi + ri) % sm.length];
  const op = so[mi % so.length];
  const bk = so[(mi + 1) % so.length];
  if (role === "Presiding Officer") {
    if (mode === "fixedPresident") return so[0] || "President";
    if (mode === "officerRotation") return op;
    if (mode === "qualifiedMemberRotation") return `${mp} / Backup: ${bk}`;
    if (mode === "combinedWithToastmaster") return "Combined with Toastmaster";
    return "Open / Manual Assignment";
  }
  if (role === "Toastmaster" && mode === "combinedWithToastmaster") return `${mp} / Presiding`;
  if (role.includes("VPE")||role.includes("VPM")||role.includes("VPPR")||role.includes("Secretary")||role.includes("Treasurer")) return op;
  return mp;
}

function assignRoles(roles, members, officers, mi, mode, onboardingMap = {}) {
  return roles.map((role, ri) => {
    if (onboardingMap[role]) return { role, member: onboardingMap[role], isOnboarding: true };
    return { role, member: assignRole(role, members, officers, mi, ri, mode), isOnboarding: false };
  });
}

// ─── CSV parsing ───────────────────────────────────────────────────────────────

function parseCSVText(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers:[], rows:[] };
  const parseRow = (line) => {
    const vals=[]; let cur="", inQ=false;
    for (const ch of line) { if (ch==='"') inQ=!inQ; else if (ch===','&&!inQ) { vals.push(cur.trim()); cur=""; } else cur+=ch; }
    vals.push(cur.trim());
    return vals.map(v=>v.replace(/^"|"$/g,"").trim());
  };
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(l=>{ const v=parseRow(l); return Object.fromEntries(headers.map((h,i)=>[h,v[i]??""])); }).filter(r=>Object.values(r).some(v=>v!==""));
  return { headers, rows };
}

function detectFileType(filename, headers) {
  const n = filename.toLowerCase().replace(/[\s_\-]/g,"");
  const h = headers.join("|").toLowerCase();
  if (n.includes("membership")||n.includes("memberlist")) return "membership";
  if (n.includes("attendance")) return "attendance";
  if (n.includes("schedule")||n.includes("meeting")) return "schedule";
  if (n.includes("roster")) return "roster";
  if (/first.?name|last.?name/.test(h)&&/status|paid/.test(h)) return "membership";
  if (/present|attended/.test(h)) return "attendance";
  if (/toastmaster|speaker.?1/.test(h)) return "schedule";
  return "unknown";
}

function parseMembership(rows, headers) {
  const firstCol=headers.find(h=>/first.?name/i.test(h)), lastCol=headers.find(h=>/last.?name/i.test(h));
  const nameCol=headers.find(h=>/^(member.?)?name$/i.test(h)), statusCol=headers.find(h=>/^status$/i.test(h));
  return rows.filter(r=>!statusCol||/active|honorary/i.test(r[statusCol]||"")).map(r=>{ if (firstCol&&lastCol) return `${r[firstCol]} ${r[lastCol]}`.trim(); if (nameCol) return (r[nameCol]||"").trim(); return null; }).filter(Boolean);
}

function detectAttendanceFormat(headers) {
  if (headers.some(h=>/^(meeting.?)?date$/i.test(h))&&headers.some(h=>/present|attend|status/i.test(h))) return "long";
  return "wide";
}
function isPresent(v) { return /^(x|y|yes|1|p|present|attended|✓)$/i.test((v||"").trim()); }

function parseWideAttendance(rows, headers) {
  const nc=headers.find(h=>/name|member/i.test(h))||headers[0], dc=headers.filter(h=>h!==nc);
  const counts={};
  for (const r of rows) { const n=(r[nc]||"").trim(); if (!n) continue; counts[n]=dc.filter(c=>isPresent(r[c])).length; }
  return counts;
}
function parseLongAttendance(rows, headers) {
  const nc=headers.find(h=>/member|name/i.test(h)&&!/date/i.test(h)), pc=headers.find(h=>/present|attend|status/i.test(h));
  const counts={};
  for (const r of rows) { const n=(r[nc]||"").trim(); if (!n) continue; if (!pc||isPresent(r[pc])) counts[n]=(counts[n]||0)+1; }
  return counts;
}
function parseAttendance(rows, headers) { return detectAttendanceFormat(headers)==="long" ? parseLongAttendance(rows,headers) : parseWideAttendance(rows,headers); }

function parseScheduleDates(rows, headers) {
  const dc=headers.find(h=>/^(meeting.?)?date$/i.test(h)||/^date/i.test(h));
  if (!dc) return [];
  return rows.map(r=>{ const d=new Date(r[dc]); return isNaN(d.getTime())?null:d; }).filter(Boolean).sort((a,b)=>a-b);
}
function detectCadenceFromDates(dates) {
  if (dates.length<2) return { cadence:"weekly", weekday:dates[0]?.getDay()??1 };
  const gaps=dates.slice(1).map((d,i)=>Math.round((d-dates[i])/86400000));
  const avg=gaps.reduce((a,b)=>a+b,0)/gaps.length, wd=dates[0].getDay();
  if (avg<=9) return { cadence:"weekly", weekday:wd };
  if (avg<=18) { const ws=dates.map(d=>Math.ceil(d.getDate()/7)); if (ws.every(w=>w===1||w===3)) return { cadence:"firstThird", weekday:wd }; if (ws.every(w=>w===2||w===4)) return { cadence:"secondFourth", weekday:wd }; return { cadence:"biweekly", weekday:wd }; }
  return { cadence:"monthly", weekday:wd };
}

// ─── CSVImportPanel ────────────────────────────────────────────────────────────

const TYPE_CHIP = { membership:"bg-slate-100 text-slate-700", attendance:"bg-blue-100 text-blue-700", schedule:"bg-green-100 text-green-700", roster:"bg-purple-100 text-purple-700", unknown:"bg-amber-100 text-amber-700" };

function filePreviewLine(f) {
  if (f.type==="membership") return `${f.members?.length??0} active members`;
  if (f.type==="attendance") return `${Object.keys(f.attendanceCounts??{}).length} members tracked · ${f.format} format`;
  if (f.type==="schedule") return f.scheduleInfo ? `${f.scheduleInfo.meetingCount} meetings · ${cadenceLabel(f.scheduleInfo.cadence)} · from ${f.scheduleInfo.startDate}` : "No date column detected";
  if (f.type==="roster") return "Loaded (officer pool support coming in Phase 6)";
  return "Type not recognised — check filename or headers";
}

function CSVImportPanel({ onApply }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const process = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSVText(e.target.result);
      const type = detectFileType(file.name, headers);
      let p = { name:file.name, type };
      if (type==="membership") p.members=parseMembership(rows,headers);
      else if (type==="attendance") { p.format=detectAttendanceFormat(headers); p.attendanceCounts=parseAttendance(rows,headers); }
      else if (type==="schedule") { const dates=parseScheduleDates(rows,headers); p.scheduleInfo=dates.length>0?{ startDate:dates[0].toISOString().split("T")[0], meetingCount:dates.length, ...detectCadenceFromDates(dates) }:null; }
      setFiles(prev=>{ const f=type==="unknown"?prev:prev.filter(x=>x.type!==type); return [...f,p]; });
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e)=>{ e.preventDefault(); setDragging(false); Array.from(e.dataTransfer.files).filter(f=>f.name.endsWith(".csv")).forEach(process); },[process]);
  const onInput = useCallback((e)=>{ Array.from(e.target.files).forEach(process); e.target.value=""; },[process]);

  const buildPayload = () => {
    const mf=files.find(f=>f.type==="membership"), af=files.find(f=>f.type==="attendance"), sf=files.find(f=>f.type==="schedule");
    const payload={};
    let list=mf?.members??[];
    if (af?.attendanceCounts) { const c=af.attendanceCounts; list=list.length>0?[...list].sort((a,b)=>(c[b]||0)-(c[a]||0)):Object.entries(c).sort(([,a],[,b])=>b-a).map(([n])=>n); }
    if (list.length>0) payload.members=list;
    if (sf?.scheduleInfo) Object.assign(payload,sf.scheduleInfo);
    return payload;
  };

  const hasUsable = files.some(f=>f.type!=="unknown");

  return (
    <div className="space-y-3">
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>ref.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragging?"border-slate-500 bg-slate-100":"border-slate-300 hover:border-slate-400 hover:bg-slate-50"}`}>
        <FileUp size={20} className="mx-auto mb-2 text-slate-400"/>
        <p className="text-sm font-medium text-slate-600">Drop CSVs here or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">membership · attendance · schedule</p>
        <input ref={ref} type="file" accept=".csv" multiple onChange={onInput} className="hidden"/>
      </div>
      {files.length>0&&(
        <div className="space-y-2">
          {files.map(f=>(
            <div key={f.name} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_CHIP[f.type]}`}>{f.type}</span>
                  <span className="truncate text-xs text-slate-500">{f.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{filePreviewLine(f)}</p>
              </div>
              <button onClick={()=>setFiles(p=>p.filter(x=>x.name!==f.name))} className="shrink-0 text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>
          ))}
          {files.find(f=>f.type==="membership")&&files.find(f=>f.type==="attendance")&&(
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">Attendance data found — members ranked by meeting frequency, most consistent first.</p>
          )}
          {hasUsable&&(
            <button onClick={()=>onApply(buildPayload())} style={{backgroundColor:TM.maroon}} className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">Apply Import</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export default function ToastmastersVpeAgendaEngine() {
  const [clubName, setClubName]           = useState("Sample Toastmasters Club");
  const [startDate, setStartDate]         = useState("2026-06-01");
  const [meetingCount, setMeetingCount]   = useState(5);
  const [weekday, setWeekday]             = useState(1);
  const [meetingTime, setMeetingTime]     = useState("6:30 PM – 7:45 PM Central");
  const [membersText, setMembersText]     = useState(defaultMembers.join("\n"));
  const [officersText, setOfficersText]   = useState(defaultOfficers.join("\n"));
  const [cadence, setCadence]             = useState("weekly");
  const [pattern, setPattern]             = useState("threeOneOne");
  const [presidingMode, setPresidingMode] = useState("officerRotation");
  const [libraryMode, setLibraryMode]     = useState("core");       // "core" | "master"
  const [planningHorizon, setPlanningHorizon] = useState("5wk");
  const [themeStartIndex, setThemeStartIndex] = useState(0);
  const [vocabularyLevel, setVocabularyLevel] = useState("mixed");
  const [repeatWindowMonths, setRepeatWindowMonths] = useState(36);
  const [importOpen, setImportOpen]       = useState(false);
  const [newMembersText, setNewMembersText] = useState("");
  const [lockedWeeks, setLockedWeeks]     = useState(2);
  const [wordBankEnabled, setWordBankEnabled] = useState(false);

  const themePool = libraryMode === "master" ? masterPool : corePool;

  const members = useMemo(()=>membersText.split("\n").map(m=>m.trim()).filter(Boolean),[membersText]);
  const officers = useMemo(()=>officersText.split("\n").map(m=>m.trim()).filter(Boolean),[officersText]);

  const handleHorizonChange = useCallback((h) => {
    setPlanningHorizon(h);
    const count = horizonToCount(h, cadence);
    if (count) setMeetingCount(count);
  }, [cadence]);

  const applyImport = useCallback((payload) => {
    if (payload.members?.length) setMembersText(payload.members.join("\n"));
    if (payload.startDate) setStartDate(payload.startDate);
    if (payload.meetingCount) setMeetingCount(payload.meetingCount);
    if (payload.cadence) setCadence(payload.cadence);
    if (payload.weekday !== undefined) setWeekday(payload.weekday);
    setImportOpen(false);
  }, []);

  const newMembers = useMemo(() => parseNewMembers(newMembersText), [newMembersText]);
  const lockedCount = useMemo(() => lockedMeetingCount(lockedWeeks, cadence), [lockedWeeks, cadence]);

  const schedule = useMemo(() => {
    const dates = getNextDates(startDate, Number(meetingCount), Number(weekday), cadence);
    const usedWordIds = new Set();
    return dates.map((date, i) => {
      const week = ordinalWeekOfMonth(date);
      const base = themePool[(Number(themeStartIndex) + i) % themePool.length];
      const themePackage = wordBankEnabled
        ? buildThemePackageFromBank(base, vocabularyLevel, usedWordIds, wordBank)
        : buildThemePackage(base, vocabularyLevel);
      const tpl = getAgendaTemplate(pattern, week, i);
      // Build onboarding priority map: roleKey → member name
      const onboardingMap = {};
      const claimedMembers = new Set();
      for (const nm of newMembers) {
        const step = getOnboardingStep(nm.joinDate, date);
        if (step && tpl.roles.includes(step.roleKey) && !claimedMembers.has(nm.name)) {
          onboardingMap[step.roleKey] = nm.name;
          claimedMembers.add(nm.name);
        }
      }
      return {
        date, week, type:tpl.label, description:tpl.description, themePackage,
        roles: assignRoles(tpl.roles, members, officers, i, presidingMode, onboardingMap)
      };
    });
  }, [startDate,meetingCount,weekday,cadence,pattern,members,officers,themePool,themeStartIndex,vocabularyLevel,presidingMode,newMembers,wordBankEnabled]);

  const issues = useMemo(() => {
    const w=[], rotating=["threeOneOne","hybrid","growthCycle","educationCycle","membershipCycle"];
    if (!clubName.trim()) w.push("Club name is missing.");
    if (members.length<8) w.push("Member pool is thin. Consider assigning guests, open roles, or combining listening roles.");
    if (officers.length<2&&["fixedPresident","officerRotation","qualifiedMemberRotation"].includes(presidingMode)) w.push("Officer pool is thin. Presiding officer rotation needs at least two eligible officers.");
    if (rotating.includes(pattern)&&Number(meetingCount)<4) w.push("A rotating agenda format is easier to validate with at least four meetings visible.");
    if (cadence==="monthly"&&Number(meetingCount)>36) w.push("Monthly cadence with more than 36 meetings exceeds the 36-month planning horizon.");
    if (Number(meetingCount)>themePool.length) w.push(`The ${libraryMode==="master"?"72":"36"}-month library has ${themePool.length} entries — themes will begin repeating across this schedule.`);
    if (Number(repeatWindowMonths)<24) w.push("Vocabulary repeat protection below 24 months may allow words to return too soon.");
    if (planningHorizon==="72mo"&&libraryMode==="core") w.push("72-month horizon selected with 36-month core library — switch to Master Cycle to access the full library.");
    return w;
  }, [clubName,members.length,officers.length,presidingMode,pattern,cadence,meetingCount,repeatWindowMonths,themePool.length,libraryMode,planningHorizon]);

  const themeStats = useMemo(() => {
    const words = new Set(themePool.flatMap(t=>[t.word,t.advanced]));
    return { meetings:themePool.length, words:words.size };
  }, [themePool]);

  const visibleArcs = libraryMode === "master" ? allYearArcs : allYearArcs.slice(0, 3);

  const exportText = () => {
    const lines=[`${clubName} — VPE Agenda Schedule Draft`,`Meeting Time: ${meetingTime}`,`Meeting Cadence: ${cadenceLabel(cadence)}`,`Agenda Format Pattern: ${formatPatternLabel(pattern)}`,`Presiding Officer Mode: ${presidingOfficerModes[presidingMode]}`,`Library Mode: ${libraryMode==="master"?"72-Month Master Cycle":"36-Month Core Cycle"}`,`Planning Horizon: ${planningHorizon}`,`Vocabulary Mode: ${difficultyLabel(vocabularyLevel)}`,`Repeat Protection Target: ${repeatWindowMonths} months`,""];
    schedule.forEach(m=>{ const t=m.themePackage; lines.push(`${formatDate(m.date)} — ${m.type}`); lines.push(`Cycle: ${t.cycle||"Formation"} | Arc: ${t.arc} | Monthly Theme: ${t.monthlyTheme}`); lines.push(`Meeting Theme: ${t.theme}`); lines.push(`Word of the Day: ${t.wordOfDay} (${t.partOfSpeech})`); lines.push(`Advanced Word: ${t.advancedWord}`); lines.push(`Definition: ${t.definition}`); lines.push(`Usage: ${t.example}`); m.roles.forEach(r=>lines.push(`- ${r.role}: ${r.member}`)); lines.push(""); });
    navigator.clipboard.writeText(lines.join("\n"));
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1F2E]/30";

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900" style={{fontFamily:"system-ui,'Segoe UI',sans-serif"}}>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── header ── */}
        <motion.header initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 w-full" style={{background:`linear-gradient(90deg,${TM.maroon},${TM.gold})`}}/>
          <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest" style={{color:TM.maroon}}>Toastmasters Operations</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">VPE Agenda Schedule Engine</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Generate repeatable agenda schedules with cadence control, format patterns, officer-aware presiding logic, member rotation, and a 72-month theme/vocabulary master library.
              </p>
            </div>
            <button onClick={exportText} style={{backgroundColor:TM.maroon}} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
              <Download size={16}/> Copy Schedule
            </button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── sidebar ── */}
          <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">

            {/* CSV Import */}
            <div className="rounded-xl border border-slate-200 bg-slate-50">
              <button onClick={()=>setImportOpen(o=>!o)} className="flex w-full items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileUp size={16} style={{color:TM.maroon}}/>
                  <span className="text-sm font-semibold text-slate-700">Import from CSV</span>
                </div>
                <span className="text-xs text-slate-400">{importOpen?"▲":"▼"}</span>
              </button>
              {importOpen&&(
                <div className="border-t border-slate-200 p-4">
                  <p className="mb-3 text-xs text-slate-500">Drop your TI membership export and FreeToastHost attendance/schedule CSVs. Files are detected by filename and headers — nothing leaves your browser.</p>
                  <CSVImportPanel onApply={applyImport}/>
                </div>
              )}
            </div>

            {/* Schedule section */}
            <div className="flex items-center gap-2">
              <ClipboardList size={18} style={{color:TM.maroon}}/>
              <h2 className="text-lg font-semibold">Schedule Inputs</h2>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Club / Program Name</span>
              <input value={clubName} onChange={e=>setClubName(e.target.value)} className={inputCls}/>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Planning Horizon</span>
              <select value={planningHorizon} onChange={e=>handleHorizonChange(e.target.value)} className={inputCls}>
                <optgroup label="Rolling Window (recommended)">
                  <option value="3wk">3 weeks — tight window</option>
                  <option value="5wk">5 weeks — rolling window</option>
                </optgroup>
                <optgroup label="Extended Planning">
                  <option value="3mo">3 months</option>
                  <option value="6mo">6 months</option>
                  <option value="12mo">12 months</option>
                  <option value="36mo">36 months</option>
                  <option value="72mo">72 months — full master library</option>
                </optgroup>
              </select>
              <span className="text-xs text-slate-400">Sets meeting count automatically · override below</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Start Date</span>
                <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className={inputCls}/>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Meeting Count</span>
                <input type="number" min="1" max="312" value={meetingCount} onChange={e=>setMeetingCount(Number(e.target.value))} className={inputCls}/>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Meeting Day</span>
              <select value={weekday} onChange={e=>setWeekday(Number(e.target.value))} className={inputCls}>
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=><option key={d} value={i}>{d}</option>)}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Meeting Time</span>
              <input value={meetingTime} onChange={e=>setMeetingTime(e.target.value)} className={inputCls}/>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Meeting Cadence</span>
              <select value={cadence} onChange={e=>setCadence(e.target.value)} className={inputCls}>
                <option value="weekly">Weekly</option>
                <option value="firstThird">1st & 3rd week of the month</option>
                <option value="secondFourth">2nd & 4th week of the month</option>
                <option value="biweekly">Biweekly from start date</option>
                <option value="monthly">Monthly on the 1st matching weekday</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Agenda Format Pattern</span>
              <select value={pattern} onChange={e=>setPattern(e.target.value)} className={inputCls}>
                {Object.entries(agendaPatternOptions).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </label>

            {/* Presiding Logic */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} style={{color:TM.maroon}}/>
                <h2 className="text-lg font-semibold">Presiding Logic</h2>
              </div>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Presiding Officer Mode</span>
                <select value={presidingMode} onChange={e=>setPresidingMode(e.target.value)} className={inputCls}>
                  {Object.entries(presidingOfficerModes).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Officer / Eligible Presider Pool</span>
                <textarea value={officersText} onChange={e=>setOfficersText(e.target.value)} rows={5} className={`${inputCls} font-mono`}/>
              </label>
            </div>

            {/* Theme Engine */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{color:TM.maroon}}/>
                <h2 className="text-lg font-semibold">Theme & Word Engine</h2>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">Theme Library Mode</span>
                <select value={libraryMode} onChange={e=>setLibraryMode(e.target.value)} className={inputCls}>
                  <option value="core">36-Month Core Cycle — Formation (Years 1–3)</option>
                  <option value="master">72-Month Master Cycle — Formation + Mastery (Years 1–6)</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium">Starting Theme Position</span>
                <select value={themeStartIndex} onChange={e=>setThemeStartIndex(Number(e.target.value))} className={inputCls}>
                  {themePool.map((t,i)=><option key={`${t.theme}-${i}`} value={i}>{i+1}. {t.arc} — {t.monthlyTheme} · {t.theme}</option>)}
                </select>
              </label>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Phase 4 Word Bank</p>
                  <p className="text-xs text-slate-500">{wordBank.length} terms · tag-based selection · repeat-tracked</p>
                </div>
                <button onClick={()=>setWordBankEnabled(v=>!v)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                  style={{backgroundColor: wordBankEnabled ? TM.maroon : "#cbd5e1"}}
                  role="switch" aria-checked={wordBankEnabled}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${wordBankEnabled?"translate-x-5":"translate-x-0"}`}/>
                </button>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">Vocabulary Difficulty</span>
                <select value={vocabularyLevel} onChange={e=>setVocabularyLevel(e.target.value)} className={inputCls}>
                  <option value="mixed">Mixed: standard word + advanced word</option>
                  <option value="standard">Professional: practical vocabulary</option>
                  <option value="advanced">Advanced: harder vocabulary emphasis</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium">Repeat Protection Window</span>
                <div className="flex items-center gap-3">
                  <input type="range" min="12" max="72" value={repeatWindowMonths} onChange={e=>setRepeatWindowMonths(Number(e.target.value))} className="w-full accent-[#7B1F2E]"/>
                  <span className="w-16 text-right text-sm font-semibold">{repeatWindowMonths} mo.</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>12 (new club)</span><span>36 (weekly)</span><span>72 (district)</span>
                </div>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Member Rotation Pool</span>
              <textarea value={membersText} onChange={e=>setMembersText(e.target.value)} rows={8} className={`${inputCls} font-mono`}/>
            </label>

            {/* New Member Onboarding */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <Users size={18} style={{color:TM.maroon}}/>
                <h2 className="text-lg font-semibold">New Member Onboarding</h2>
              </div>
              <p className="text-xs text-slate-500">
                One name per line. Optionally add a join date: <code className="rounded bg-slate-100 px-1">Name | YYYY-MM-DD</code>. Omit date to use today. New members receive priority role placement through their first 7 meetings.
              </p>
              <label className="block space-y-1">
                <span className="text-sm font-medium">New Members</span>
                <textarea value={newMembersText} onChange={e=>setNewMembersText(e.target.value)} rows={3}
                  placeholder={"Jane Doe | 2026-06-01\nJohn Smith"} className={`${inputCls} font-mono text-xs`}/>
              </label>
              {newMembers.length>0&&(
                <div className="space-y-2">
                  {newMembers.map(nm=>{
                    const step=getOnboardingStep(nm.joinDate, new Date());
                    return (
                      <div key={nm.name} className="rounded-lg border border-slate-200 p-3" style={{backgroundColor:TM.maroonLight}}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">{nm.name}</span>
                          {step
                            ? <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{backgroundColor:TM.maroon}}>Step {step.step}: {step.label}</span>
                            : <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Graduated ✓</span>
                          }
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Joined {nm.joinDate}</p>
                        {step&&<p className="mt-0.5 text-xs text-slate-600">Next: <span className="font-medium">{ONBOARDING_STEPS[step.step]?.label||"Full rotation"}</span></p>}
                      </div>
                    );
                  })}
                </div>
              )}
              <label className="block space-y-1">
                <span className="text-sm font-medium">Locked Window</span>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="4" value={lockedWeeks} onChange={e=>setLockedWeeks(Number(e.target.value))} className="w-full accent-[#7B1F2E]"/>
                  <span className="w-10 text-right text-sm font-semibold">{lockedWeeks}wk</span>
                </div>
                <span className="text-xs text-slate-400">First {lockedCount} meeting(s) locked — confirmed and not adjusted</span>
              </label>
            </div>
          </aside>

          {/* ── main content ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon:<Calendar size={16}/>, label:"Meetings Built", value:schedule.length, sub:cadenceLabel(cadence) },
                { icon:<Users size={16}/>,    label:"Member Pool",    value:members.length,  sub:formatPatternLabel(pattern) },
                { icon:<ShieldCheck size={16}/>,label:"Presiders",    value:officers.length, sub:presidingOfficerModes[presidingMode] },
                { icon:<Layers size={16}/>,   label:"Theme Library",  value:themeStats.meetings, sub:`${themeStats.words} vocabulary terms` }
              ].map(({icon,label,value,sub})=>(
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2" style={{color:TM.maroon}}>{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs text-slate-500 truncate">{sub}</p>
                </div>
              ))}
            </div>

            {/* Architecture panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-lg font-bold">72-Month Master Theme Architecture</h2>
                <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                  <div>Current Mode: <span className="font-semibold">{libraryMode==="master"?"72-month master cycle":"36-month core cycle"}</span></div>
                  <div>Planning Horizon: <span className="font-semibold">{planningHorizon}</span></div>
                  <div>Repeat Protection: <span className="font-semibold">{repeatWindowMonths} months</span></div>
                  <div>Word Bank: <span className="font-semibold">{wordBankEnabled?`Active — ${wordBank.length} terms`:"Inline (theme-linked)"}</span></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleArcs.map(({year,arc,cycle,desc})=>(
                  <div key={year} className="rounded-xl border p-4" style={{borderColor: cycle==="Mastery" ? TM.gold : "#e2e8f0", backgroundColor: cycle==="Mastery" ? TM.goldLight : "#f8fafc"}}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{color: cycle==="Mastery" ? "#92400e" : TM.maroon}}>Year {year}</p>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{backgroundColor: cycle==="Mastery"?"#fef3c7":"#f5e8ea", color: cycle==="Mastery"?"#92400e":TM.maroon}}>{cycle}</span>
                    </div>
                    <p className="mt-1 font-bold text-slate-800">{arc}</p>
                    <p className="mt-1 text-xs text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
              {libraryMode==="core"&&(
                <p className="mt-3 text-xs text-slate-400">Switch to <strong>72-Month Master Cycle</strong> in Theme Library Mode to unlock Years 4–6 (Communication Mastery, Strategic Leadership, Institutional Legacy).</p>
              )}
            </div>

            {/* Warnings */}
            {issues.length>0&&(
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 font-semibold text-amber-900"><AlertTriangle size={18}/> VPE Review Flags</div>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-amber-900">
                  {issues.map(i=><li key={i}>{i}</li>)}
                </ul>
              </div>
            )}

            {/* Schedule cards */}
            <div className="space-y-4">
              {schedule.map((meeting, idx)=>{
                const t=meeting.themePackage;
                const isMastery = t.cycle==="Mastery";
                const isLocked = idx < lockedCount;
                return (
                  <React.Fragment key={meeting.date.toISOString()}>
                  {idx===lockedCount&&lockedCount>0&&(
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 border-t-2 border-dashed border-amber-300"/>
                      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">↓ Adjustment Window — apply roster changes below</span>
                      <div className="flex-1 border-t-2 border-dashed border-amber-300"/>
                    </div>
                  )}
                  <motion.article initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:idx*0.03}}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${isLocked?"border-slate-300 opacity-90":"border-slate-200"}`}>
                    <div className="h-0.5" style={{background: isMastery?TM.gold:TM.maroon}}/>
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{formatDate(meeting.date)}</h3>
                          {isLocked&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">🔒 Locked</span>}
                        </div>
                        <p className="text-sm text-slate-500">{meetingTime}</p>
                      </div>
                      <div className="flex flex-col items-start gap-1.5 md:items-end">
                        <span className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold text-white" style={{backgroundColor:isMastery?"#92400e":TM.maroon}}>{meeting.type}</span>
                        <p className="max-w-xs text-xs text-slate-400 md:text-right">{meeting.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
                      <div className="space-y-3 rounded-xl p-4" style={{backgroundColor: isMastery?TM.goldLight:"#f8fafc"}}>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide" style={{color:TM.maroon}}>Theme Package</p>
                          <p className="mt-1 font-bold text-slate-800">{t.theme}</p>
                          <p className="text-xs text-slate-500">Cycle: {t.cycle||"Formation"}</p>
                          <p className="text-xs text-slate-500">Arc: {t.arc}</p>
                          <p className="text-xs text-slate-500">Monthly Theme: {t.monthlyTheme}</p>
                        </div>
                        <div className="rounded-lg border border-white bg-white p-3 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Word of the Day</p>
                          <p className="text-lg font-bold" style={{color:TM.maroon}}>{t.wordOfDay}</p>
                          <p className="text-xs text-slate-500">{t.partOfSpeech} · {t.difficulty}</p>
                        </div>
                        <div className="rounded-lg border border-white bg-white p-3 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Advanced Word</p>
                          <p className="text-base font-bold text-slate-800">{t.advancedWord}</p>
                        </div>
                        <div className="text-xs text-slate-700 space-y-1">
                          <p><span className="font-semibold">Definition:</span> {t.definition}</p>
                          <p><span className="font-semibold">Usage:</span> {t.example}</p>
                        </div>
                      </div>
                      <div className="lg:col-span-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-left">
                              <th className="py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                              <th className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned</th>
                            </tr>
                          </thead>
                          <tbody>
                            {meeting.roles.map(r=>(
                              <tr key={r.role} className="border-b border-slate-100 last:border-0">
                                <td className="py-1.5 pr-3 font-medium text-slate-700">{r.role}</td>
                                <td className="py-1.5 text-slate-600">
                                  <span>{r.member}</span>
                                  {r.isOnboarding&&<span className="ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold" style={{backgroundColor:TM.maroonLight,color:TM.maroon}}>New ★</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.article>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
