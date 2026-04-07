import sys, re

path = "/Users/abhiram/Documents/unheard/app/services/page.tsx"
with open(path, 'r') as f:
    text = f.read()

# 1. Remove all min-h-[140vh]
text = text.replace(' min-h-[140vh]', '')

# 2. Normalize widths
text = text.replace('w-full md:w-[95vw] lg:w-[90vw] max-w-[1400px]', 'w-[97vw] max-w-[2440px]')
text = text.replace('w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px]', 'w-[97vw] max-w-[2440px]')

# 3. Remove massive 800px and 200px spacers
text = text.replace('<div className="h-[800px] w-full" />', '')
text = re.sub(r'\{\/\* FOOTER SPACER \*\/\}\n\s*<div className="h-\[200px\] w-full" \/>', '', text)

# 4. Fix Section Wrappers (Cards 2, 3, 4, 5) overlap classes
for z in ['20', '30', '40', '50']:
    tgt = f'className="sticky z-{z} w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"'
    rep = f'className="sticky z-{z} w-full flex justify-center pb-20 -mt-[150px] pointer-events-none"'
    text = text.replace(tgt, rep)

# 5. Add pointer-events-auto to affected cards
cards = [
    'bg-[#171612] rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24',
    'bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24',
    'bg-[#1a1a1a] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 text-white',
    'bg-white rounded-[40px] md:rounded-[60px] shadow-[0_[-60px]_120px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24'
]
for c in cards:
    text = text.replace(c, c + ' pointer-events-auto')

if "w-[97vw] max-w-[2440px]" not in text:
    print("FAILED TO REPLACE WIDTHS")
    sys.exit(1)

# 6. Make buttons responsive
# Button 1
text = text.replace(
    'className="px-20 h-[72px] rounded-full text-[20px] font-bold shadow-2xl transition-transform hover:scale-105"',
    'className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1"'
)
# Button 2
text = text.replace(
    'className="bg-white text-black hover:bg-gray-100 rounded-full px-16 h-[72px] font-bold text-[20px] shrink-0 shadow-2xl transition-all hover:scale-105"',
    'className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] shrink-0 shadow-2xl transition-transform hover:-translate-y-1"'
)
# Button 3
text = text.replace(
    'className="px-16 h-[72px] rounded-full text-[20px] font-bold shadow-2xl transition-transform hover:scale-105"',
    'className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1"'
)
# Button 4
text = text.replace(
    'className="bg-white text-black hover:bg-gray-100 rounded-full px-16 h-[72px] font-bold text-[20px] transition-all hover:scale-105"',
    'className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] transition-transform hover:-translate-y-1"'
)
# Button 5
text = text.replace(
    'className="px-20 h-[80px] rounded-full text-[24px] font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all"',
    'className="w-[280px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-extrabold shadow-2xl transition-transform hover:-translate-y-1"'
)
text = text.replace(
    'className="h-[80px] px-12 rounded-full border-[3px] border-black text-black font-black text-[22px] hover:bg-black hover:text-white transition-all text-center"',
    'className="w-[280px] md:w-[300px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full border-[3px] border-black text-black font-black text-[16px] md:text-[20px] hover:bg-black hover:text-white transition-all text-center"'
)

with open(path, 'w') as f:
    f.write(text)

