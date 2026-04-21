import {
  IconBrandAws,
  IconBrandDocker,
  IconBrandNextjs,
  IconBrandPython,
  IconBrandReact,
  IconBrandTypescript,
  IconBolt,
  IconBrain,
  IconCode,
  IconDatabase,
} from "@tabler/icons-react"

const icons = [
  {
    Icon: IconBrandPython,
    left: "5%",
    top: "18%",
    size: 44,
    delay: "0s",
    animation: "float 5s ease-in-out infinite",
  },
  {
    Icon: IconBrandTypescript,
    left: "2%",
    top: "45%",
    size: 36,
    delay: "1.2s",
    animation: "float-reverse 6s ease-in-out infinite",
  },
  {
    Icon: IconBrandNextjs,
    left: "10%",
    top: "72%",
    size: 40,
    delay: "2.4s",
    animation: "float 5.5s ease-in-out infinite",
  },
  {
    Icon: IconBolt,
    left: "14%",
    top: "32%",
    size: 32,
    delay: "0.6s",
    animation: "float-reverse 7s ease-in-out infinite",
  },
  {
    Icon: IconBrandReact,
    right: "6%",
    top: "20%",
    size: 42,
    delay: "1.8s",
    animation: "float 4.5s ease-in-out infinite",
  },
  {
    Icon: IconBrandAws,
    right: "2%",
    top: "48%",
    size: 38,
    delay: "0.9s",
    animation: "float-reverse 5.5s ease-in-out infinite",
  },
  {
    Icon: IconBrandDocker,
    right: "9%",
    top: "74%",
    size: 44,
    delay: "2.1s",
    animation: "float 6s ease-in-out infinite",
  },
  {
    Icon: IconDatabase,
    right: "13%",
    top: "36%",
    size: 34,
    delay: "1.5s",
    animation: "float-reverse 4.5s ease-in-out infinite",
  },
  {
    Icon: IconCode,
    left: "7%",
    top: "58%",
    size: 30,
    delay: "3s",
    animation: "float 5s ease-in-out infinite",
  },
  {
    Icon: IconBrain,
    right: "5%",
    top: "60%",
    size: 32,
    delay: "2.7s",
    animation: "float-reverse 6.5s ease-in-out infinite",
  },
]

export function FloatingIcons() {
  return (
    <div
      className="hidden lg:block pointer-events-none absolute inset-0 z-[1]"
      aria-hidden="true"
    >
      {icons.map(({ Icon, left, right, top, size, delay, animation }, i) => (
        <div
          key={i}
          className="absolute text-foreground"
          style={{
            left,
            right,
            top,
            opacity: 0.25,
            animation,
            animationDelay: delay,
          }}
        >
          <Icon width={size} height={size} stroke={1.2} />
        </div>
      ))}
    </div>
  )
}
