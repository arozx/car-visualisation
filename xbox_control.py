import curses
from time import sleep

import requests
from approxeng.input.controllers import ControllerRequirement, find_matching_controllers
from approxeng.input.selectbinder import bind_controllers

discovery = None

# Connect to controller
while discovery is None:
    try:
        discovery = find_matching_controllers(
            ControllerRequirement(require_snames=["lx", "ly", "rx", "ry"])
        )[0]
    except IOError:
        print("No suitable controller found yet")
        sleep(0.5)


# Bind the controller to the function
unbind_function = bind_controllers(discovery, print_events=False)

# Initialize curses
stdscr = curses.initscr()
curses.noecho()
curses.cbreak()
stdscr.keypad(True)


# Function to send coordinates to the server
def send_coordinates(x, y, z):
    payload = {"x": x, "y": y, "z": z}
    try:
        response = requests.post("http://localhost:5000/move_object", json=payload)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Failed to send coordinates: {e}")


# Main function
def main(stdscr):
    while True:
        stdscr.clear()
        try:
            for lx, ly, rx, ry in discovery.controller.stream["lx", "ly", "rx", "ry"]:
                stdscr.addstr(0, 0, "Left stick: x={}, y={}".format(lx, ly))
                stdscr.addstr(1, 0, "Right stick: x={}, y={}".format(rx, ry))

                # Send coordinates to the server
                send_coordinates(lx, ly, 0)

                # Handle button presses
                presses = discovery.controller.check_presses()
                if "cross" in presses:
                    stdscr.addstr(2, 0, "Motors off")

                stdscr.refresh()
                sleep(0.1)

        except StopIteration:
            print("Controller disconnected")
            pass
        except KeyboardInterrupt:
            print("Exiting...")
            sleep(0.1)
            break


# Call the main function
curses.wrapper(main)

# Clean up
unbind_function()
