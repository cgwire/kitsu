def rgb_to_hex(color):
    """
    Return color as #rrggbb for the given color values.
    """
    [red, green, blue] = color.split(",")
    return "#%02x%02x%02x" % (int(red), int(green), int(blue))
