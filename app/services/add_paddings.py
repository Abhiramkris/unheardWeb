import sys

path = "/Users/abhiram/Documents/unheard/app/services/page.tsx"
with open(path, 'r') as f:
    text = f.read()

targets = [
    '<Button ref={target2Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] shrink-0 shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Optimize Relationship</Button>\n            </div>\n          </div>\n        </div>\n      </section>',
    '<Button ref={target3Ref} variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Support Your Child</Button>\n            </div>\n          </div>\n        </div>\n      </section>',
    '<Button ref={target4Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] transition-transform hover:-translate-y-1" onClick={openBookingModal}>Partner with unHeard.</Button>\n            </div>\n          </div>\n        </div>\n      </section>'
]

replacements = [
    '<Button ref={target2Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] shrink-0 shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Optimize Relationship</Button>\n            </div>\n          </div>\n          <div className="h-[100px] md:h-[150px] w-full shrink-0" />\n        </div>\n      </section>',
    '<Button ref={target3Ref} variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Support Your Child</Button>\n            </div>\n          </div>\n          <div className="h-[100px] md:h-[150px] w-full shrink-0" />\n        </div>\n      </section>',
    '<Button ref={target4Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] transition-transform hover:-translate-y-1" onClick={openBookingModal}>Partner with unHeard.</Button>\n            </div>\n          </div>\n          <div className="h-[100px] md:h-[150px] w-full shrink-0" />\n        </div>\n      </section>'
]

for tgt, rep in zip(targets, replacements):
    text = text.replace(tgt, rep)

with open(path, 'w') as f:
    f.write(text)

