import cv2
import numpy as np
import shutil

# Restore original story-07
shutil.copy('C:/Users/wiseflow/Documents/H Burger/story-07.jpg.jpeg', 'images/story-07.jpg.jpeg')

# --- Edit story-07.jpg.jpeg ---
img7 = cv2.imread('images/story-07.jpg.jpeg')

# Original $2 is kept 100% intact! We append .5 right next to $2 at x=1635, y=1180
cv2.putText(img7, '.5', (1635, 1180), cv2.FONT_HERSHEY_DUPLEX, 2.2, (255, 255, 255), 5, cv2.LINE_AA)

cv2.imwrite('images/story-07.jpg.jpeg', img7)

cf_crop = img7[1030:1260, 1450:1850]
cv2.imwrite('../cf_append_perfect.png', cf_crop)

print("Appended .5 perfectly next to $2!")
