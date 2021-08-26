def klee_distance(segment_list):
    """
    Klee's Algorithm for 1D segments.
    Input:
        segment_list : Queryset of segments (x, y) with x < y
    Output
        length : Total length covered by segments
        segments : Non overlapping segments that contain original segments
    """
    points = [(x.start, False) for x in segment_list] + \
             [(x.end, True) for x in segment_list]
    points.sort()
    counter = 0
    length = 0
    segments = []
    init = None
    for i in range(0, len(points)):
        if counter > 0:
            length += points[i][0] - points[i-1][0]
        if points[i][1]:
            counter -= 1
            if counter == 0:
                segments.append((init, points[i][0]))
        else:
            if counter == 0:
                init = points[i][0]
            counter += 1
    return length, segments


def make_partition_with_repetition(segment_list):
    """
    Algorithm that given a list of segments calculates the full partition of
    the union of segments given in the segment_list and counts the repeated
    segments in the partition.
    Input:
        segment_list: list of tuples representing segments (x, y) with x < y
    Output:
        segment_dict: dictionary containing all the segments that make the
                      partition as keys with the number of segments as values.
    Example:
        Input: [(1, 5), (2, 6)]
        Output: {(1, 2) : 1, (2, 5) : 2, (5, 6): 1}
    """
    points = [(x[0], False) for x in segment_list] + \
             [(x[1], True) for x in segment_list]
    points.sort()
    counter = 0
    segment_dict = {}
    for i in range(0, len(points)):
        if points[i][1]:
            counter -= 1
        else:
            counter += 1
        if counter > 0:
            # If values are different, store the segment
            x = points[i][0]
            y = points[i+1][0]
            if x != y:
                segment_dict[(x, y)] = counter
    return segment_dict


def calculate_repeated_distance(segment_dict):
    """
    Given a segment_dict, calculates the distance of the repeated segments in
    the partition
    """
    distance = 0
    for key in segment_dict.keys():
        seg_dist = (key[1]-key[0])
        distance += seg_dist * (segment_dict[key]-1)
    return distance