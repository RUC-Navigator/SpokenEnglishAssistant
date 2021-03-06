from chatterbotapi import ChatterBotFactory, ChatterBotType
import sys
import os
import pickle
"""
    chatterbotapi
    Copyright (C) 2011 pierredavidbelanger@gmail.com
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    
    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
"""

# sessionpath = sys.argv[1]
inpututtr_path = sys.argv[1]
oupututtr_path = sys.argv[2]

# if not os.path.exists(sessionpath):
#     factory = ChatterBotFactory()
#     bot = factory.create(ChatterBotType.CLEVERBOT)
#     # bot = factory.create(ChatterBotType.PANDORABOTS, 'b0dafd24ee35a477')
#     botsession = bot.create_session()
# else:
#     botsession = pickle.load(file(sessionpath))

factory = ChatterBotFactory()
# bot = factory.create(ChatterBotType.CLEVERBOT)
bot = factory.create(ChatterBotType.PANDORABOTS, 'b0dafd24ee35a477')
botsession = bot.create_session()

labeled_utterance = file(inpututtr_path).readline().strip().split('$')[-1]

utterance = ''
for i in labeled_utterance.split('>'):
    if '<span' in i:
        i = i.split('<')[0]
    elif '<' in i:
        i = i[:-6]
    utterance += i

# print utterance

s = botsession.think(utterance);
f = open(oupututtr_path, 'wb')
print >> f, s
f.close()
print s
# pickle.dump(botsession, file(sessionpath, 'wb'))
