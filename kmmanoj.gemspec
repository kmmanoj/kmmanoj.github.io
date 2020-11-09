# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "kmmanoj"
  spec.version       = "0.3.1"
  spec.authors       = ["Manoj Vignesh K M"]
  spec.email         = ["kmmanoj1990@gmail.com"]

  spec.summary       = "Manoj vignesh K M's profile"
  spec.homepage      = "https://github.com/kmmanoj/kmmanoj.github.io"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }

  spec.add_runtime_dependency "jekyll", "~> 3.8.7"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.13.0"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.6.1"
end
