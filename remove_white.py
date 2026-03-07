from PIL import Image
import glob

def remove_white(image_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # Loop through each pixel
    for item in datas:
        # If it's pure white or very close to white, make it transparent
        # item is (R, G, B, A)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(image_path, "PNG")

for file in glob.glob("d:/taskmaster/assets/*.png"):
    remove_white(file)
    print(f"Processed {file}")
