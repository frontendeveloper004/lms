/**
 * ASL client-side utilities — NO "use server" directive.
 * Safe to import from client components (ASLPlayer, etc.)
 */

// ─── Fingerspelling ───────────────────────────────────────────────────────────

const FINGERSPELL_BASE = "https://www.handspeak.com/spell/index.php?id=";

export function getFingerspellUrl(letter: string): string {
  const l = letter.toLowerCase();
  if (/^[a-z]$/.test(l)) return `${FINGERSPELL_BASE}${l}`;
  return "";
}

// ─── ASL-LEX / Handspeak clip map ────────────────────────────────────────────

const KNOWN_ASL_WORDS = new Set([
  // Greetings & basics
  "hello","hi","goodbye","bye","please","thank","you","sorry","yes","no",
  "maybe","help","stop","go","come","wait","look","see","know","think",
  "want","need","like","love","hate","good","bad","big","small","more",
  "less","new","old","fast","slow","hot","cold","open","close","start",
  "finish","again","different","same","true","false","right","wrong",
  // People & pronouns
  "i","me","my","mine","we","our","your","he","she","they","it",
  "person","people","man","woman","boy","girl","baby","family","friend",
  "teacher","student","doctor","police","name","who","what","where",
  "when","why","how","which",
  // Time
  "today","tomorrow","yesterday","now","later","before","after","always",
  "never","sometimes","morning","afternoon","evening","night","week",
  "month","year","time","hour","minute","second","day","monday","tuesday",
  "wednesday","thursday","friday","saturday","sunday",
  // Numbers
  "one","two","three","four","five","six","seven","eight","nine","ten",
  "hundred","thousand","million","first","last","next",
  // Places
  "home","house","school","work","office","hospital","store","city",
  "country","world","america","here","there","inside","outside","up",
  "down","left","right","near","far",
  // Actions
  "eat","drink","sleep","wake","walk","run","sit","stand","write","read",
  "speak","listen","watch","play","work","study","learn","teach","give",
  "take","buy","sell","pay","find","lose","win","try","use","make","do",
  "have","feel","understand","remember","forget","ask","answer","tell",
  "say","show","explain","practice","improve","change","move","stay",
  "leave","arrive","meet","talk","call","send","receive","open","close",
  "turn","push","pull","carry","hold","drop","pick",
  // Technology & programming
  "computer","phone","internet","website","app","code","program","data",
  "file","folder","save","delete","copy","paste","search","download",
  "upload","login","password","email","message","video","image","text",
  "button","screen","keyboard","mouse","click","type","print","share",
  "function","variable","class","object","array","loop","error","test",
  "build","run","install","update",
  // Education
  "lesson","course","quiz","assignment","homework","exam","grade","score",
  "pass","fail","certificate","book","page","chapter","question","answer",
  "example","practice","review","explain","understand","difficult","easy",
  "important","interesting","correct","incorrect",
  // Adjectives & adverbs
  "very","really","also","too","only","just","still","already","yet",
  "often","usually","together","alone","ready","busy","free","happy",
  "sad","angry","scared","tired","sick","healthy","clean","dirty",
  "full","empty","heavy","light","hard","soft","loud","quiet","long","short",
]);

export function getASLClipUrl(gloss: string): string | null {
  const word = gloss.toLowerCase().trim();
  if (KNOWN_ASL_WORDS.has(word)) {
    // Lifeprint.com — Dr. Bill Vicars, ASL University (free GIFs, no iframe block)
    return `https://www.lifeprint.com/asl101/gifs/${encodeURIComponent(word)}.gif`;
  }
  return null;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
