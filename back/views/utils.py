def klee_distance(segment_list):
    """
    Klee's Algorithm for 1D segments.
    Input:
        segment_list : Queryset of Segment objects with start field < end field
    Output
        length : Total length covered by segments
        segments : Non overlapping partitions that contain original start-end segments
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
    Algorithm that given a queryset of Segment objects calculates the full partition of
    the union of start-end segments given in the queryset and counts the repeated
    partitions.
    Input:
        segment_list: Queryset of Segment objects with start field < end field
    Output:
        segment_dict: dictionary containing as keys the seconds and as values 
                    the number of times it has been played
    Example:
        Input: [Segment(1, 5), Segment(2, 6)]
        Output: {'1' : 1, 
                '2' : 2, 
                '2' : 2, 
                '...' : 2,
                '4': 2, 
                '5' : 1, 
                '6' : 1}
    """
    points = [(x.start, False) for x in segment_list] + \
             [(x.end, True) for x in segment_list]
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
                #segment_dict[(x, y)] = counter
                #segment_dict[str((x, y))] = counter
                for n in range(x,y+1):
                    segment_dict[n] = counter
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