import re
import json

STUDY, GYM, MED = 1, 2, 3

KEYWORDS = {
    STUDY: {"study", "studying", "homework", "learn", "reading", "read", "notes"},
    GYM:   {"gym", "workout", "lift", "lifting", "run", "running", "exercise", "cardio"},
    MED:   {"med", "medicine", "meds", "doctor", "appointment", "therapy", "physio"},
}

CATEGORY_NAMES = {1: "study", 2: "gym", 3: "med"}

def parse_transcript(transcript: str):
    transcript = transcript.lower()
    words = transcript.split()
    results = []
    idx = 0
    while idx < len(words):
        for category, keywords in KEYWORDS.items():
            if words[idx] in keywords:
                # Look for a number after the keyword
                hour = None
                for next_word in words[idx+1:]:
                    match = re.match(r"\d+", next_word)
                    if match:
                        hour = int(match.group())
                        break
                results.append({
                    "category": CATEGORY_NAMES[category],
                    "hours": hour
                })
        idx += 1
    return results

# example/testing:
transcript = "I went to the gym and did some cardio for 2 hours after studying for 3 hours and took my medicine."
parsed = parse_transcript(transcript)

# Save to JSON file
with open("parsed_results.json", "w") as f:
    json.dump(parsed, f, indent=2)

print(parsed)